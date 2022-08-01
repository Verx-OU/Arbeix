package ee.verx.arbeix;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import ee.verx.arbeix.placeholder.Placeholder;
import ee.verx.arbeix.placeholder.Replacement;
import ee.verx.arbeix.placeholder.Replacer;
import ee.verx.arbeix.serial.PlaceholderDeserializer;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import org.odftoolkit.odfdom.doc.OdfSpreadsheetDocument;

public class Main {

  private static final TypeReference<HashMap<Placeholder, ArrayList<Replacement>>>
      placeholderTypeReference = new TypeReference<>() {};

  private static <T> Optional<T> maybeGet(List<T> collection, int index) {
    if (index >= collection.size()) return Optional.empty();
    return Optional.of(collection.get(index));
  }

  public static void main(String[] args) throws Exception {
    Path source = Path.of(args[0]);
    Path target =
        source.resolveSibling(
            source.getFileName().toString().replaceFirst("[.][^.]+$", "") + ".mod.ods");
    Path placeholderSource = Path.of(args[1]);

    var module = new SimpleModule().addDeserializer(HashMap.class, new PlaceholderDeserializer());

    var mapper = new ObjectMapper();
    mapper.registerModule(module);
    var placeholders = mapper.readValue(placeholderSource.toFile(), placeholderTypeReference);
    var localPlaceholders = new HashMap<String, ArrayList<Replacement>>();
    placeholders.forEach((k, v) -> localPlaceholders.put(k.localName(), v));

    try (var ods = OdfSpreadsheetDocument.loadDocument(source.toFile())) {
      var tables = ods.getSpreadsheetTables();
      Replacer.replaceAllInTable(
          tables.get(0),
          (k, i) ->
              Optional.ofNullable(localPlaceholders.get(k))
                  .flatMap(r -> maybeGet(r, i))
                  .orElse(new Replacement.None()));
      ods.save(target.toFile());
    }
  }
}
