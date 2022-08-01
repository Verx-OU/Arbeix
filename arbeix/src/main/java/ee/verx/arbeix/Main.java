package ee.verx.arbeix;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.verx.arbeix.placeholder.Placeholder;
import ee.verx.arbeix.placeholder.Replacement;
import ee.verx.arbeix.placeholder.Replacer;
import org.odftoolkit.odfdom.doc.OdfSpreadsheetDocument;

import java.nio.file.Path;
import java.util.HashMap;

public class Main {

  private static final TypeReference<HashMap<Placeholder, Replacement>> placeholderTypeReference =
      new TypeReference<>() {};

  public static void main(String[] args) throws Exception {
    Path source = Path.of(args[0]);
    Path target =
        source.resolveSibling(
            source.getFileName().toString().replaceFirst("[.][^.]+$", "") + ".mod.ods");
    Path placeholderSource = Path.of(args[1]);

    var objectMapper = new ObjectMapper();
    var placeholders = objectMapper.readValue(placeholderSource.toFile(), placeholderTypeReference);
    var localPlaceholders = new HashMap<String, Replacement>();
    placeholders.forEach((k, v) -> localPlaceholders.put(k.localName(), v));

    try (var ods = OdfSpreadsheetDocument.loadDocument(source.toFile())) {
      var tables = ods.getSpreadsheetTables();
      Replacer.replaceAllInTable(
          tables.get(0), i -> localPlaceholders.getOrDefault(i, new Replacement.None()));
      ods.save(target.toFile());
    }
  }
}
