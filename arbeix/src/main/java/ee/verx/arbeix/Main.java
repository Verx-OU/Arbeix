package ee.verx.arbeix;

import ee.verx.arbeix.placeholder.Placeholder;
import ee.verx.arbeix.placeholder.Replacement;
import ee.verx.arbeix.placeholder.Replacer;
import org.odftoolkit.odfdom.doc.OdfSpreadsheetDocument;

import java.nio.file.Path;
import java.util.HashMap;
import java.util.Scanner;

public class Main {

  public static void main(String[] args) throws Exception {
    var examplePlaceholders = new HashMap<String, Replacement>();
    var scanner = new Scanner(System.in);
    for (var placeholder : Placeholder.values()) {
      System.out.printf("%s / %s / %s >> ", placeholder.localName(), placeholder.name(), placeholder.type());
      String input = scanner.nextLine();
      Replacement replacement = switch (placeholder.type()) {
        case TEXT -> new Replacement.Text(input);
        case EMAIL -> new Replacement.Email(input);
        case DATE -> {
          var parts = input.split("/");
          yield new Replacement.Date(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), Integer.parseInt(parts[2]));
        }
      };
      examplePlaceholders.put(placeholder.localName(), replacement);
    }

    Path source = Path.of(args[0]);
    Path target = source.resolveSibling(source.getFileName().toString().replaceFirst("[.][^.]+$", "") + ".mod.ods");

    try (var ods = OdfSpreadsheetDocument.loadDocument(source.toFile())) {
      var tables = ods.getSpreadsheetTables();
      Replacer.replaceAllInTable(
          tables.get(0), i -> examplePlaceholders.getOrDefault(i, new Replacement.None()));
      ods.save(target.toFile());
    }
  }
}
