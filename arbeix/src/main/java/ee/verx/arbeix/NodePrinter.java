package ee.verx.arbeix;

import org.jetbrains.annotations.NotNull;
import org.w3c.dom.Node;

import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;

import static java.lang.System.out;

public class NodePrinter {

  public static void prettyPrint(Node node) {
    try {
      TransformerFactory tf = TransformerFactory.newInstance();
      Transformer transformer = tf.newTransformer();
      transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
      transformer.setOutputProperty(OutputKeys.METHOD, "xml");
      transformer.setOutputProperty(OutputKeys.INDENT, "yes");
      transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
      transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "4");

      transformer.transform(
          new DOMSource(node),
          new StreamResult(new OutputStreamWriter(out, StandardCharsets.UTF_8)));
    } catch (TransformerException e) {
      throw new RuntimeException(e);
    }
    // prettyPrint(node, "");
  }

  private static void prettyPrint(@NotNull Node node, String spacer) {
    System.out.printf("%s%s", spacer, node.getNodeName());

    if (node.getNodeValue() == null) System.out.println();
    else System.out.printf(" '%s'%n", node.getNodeValue());

    var attributes = node.getAttributes();
    if (attributes != null) {
      for (int i = 0; i < attributes.getLength(); i++) {
        out.printf(
            "%s [%s] = '%s'%n",
            spacer, attributes.item(i).getNodeName(), attributes.item(i).getNodeValue());
        // prettyPrint(attributes.item(i), spacer + "[]");
      }
    }

    var children = node.getChildNodes();
    for (int i = 0; i < children.getLength(); i++) prettyPrint(children.item(i), spacer + "- ");
  }
}
