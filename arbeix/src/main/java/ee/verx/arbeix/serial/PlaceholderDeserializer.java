package ee.verx.arbeix.serial;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.ObjectCodec;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import ee.verx.arbeix.placeholder.Placeholder;
import ee.verx.arbeix.placeholder.Replacement;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;

public class PlaceholderDeserializer
    extends JsonDeserializer<HashMap<Placeholder, ArrayList<Replacement>>> {

  private static final TypeReference<Replacement.Text> TEXT_REF = new TypeReference<>() {};
  private static final TypeReference<Replacement.Number> NUMBER_REF = new TypeReference<>() {};
  private static final TypeReference<Replacement.Email> EMAIL_REF = new TypeReference<>() {};
  private static final TypeReference<Replacement.Date> DATE_REF = new TypeReference<>() {};

  @Override
  public HashMap<Placeholder, ArrayList<Replacement>> deserialize(
      JsonParser p, DeserializationContext ctx) throws IOException {
    var map = new HashMap<Placeholder, ArrayList<Replacement>>();
    JsonNode node = p.readValueAsTree();
    ObjectCodec codec = p.getCodec();
    node.fields()
        .forEachRemaining(
            i -> {
              var key = Placeholder.valueOf(i.getKey());
              var cls =
                  switch (key.type()) {
                    case TEXT -> TEXT_REF;
                    case NUMBER -> NUMBER_REF;
                    case EMAIL -> EMAIL_REF;
                    case DATE -> DATE_REF;
                  };
              var replacements = new ArrayList<Replacement>();
              map.put(key, replacements);

              Iterable<JsonNode> children = Collections.singleton(i.getValue());
              if (i.getValue().isArray()) children = i.getValue();

              children.forEach(
                  j -> {
                    try (var parser = j.traverse(codec)) {
                      replacements.add(parser.readValueAs(cls));
                    } catch (IOException e) {
                      throw new RuntimeException(e);
                    }
                  });
            });

    return map;
  }
}
