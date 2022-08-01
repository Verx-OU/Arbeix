package ee.verx.arbeix.placeholder;

import ee.verx.arbeix.NodePrinter;
import org.jetbrains.annotations.NotNull;
import org.odftoolkit.odfdom.doc.table.OdfTable;
import org.odftoolkit.odfdom.dom.attribute.xlink.XlinkTypeAttribute;
import org.odftoolkit.odfdom.dom.element.text.TextAElement;
import org.odftoolkit.odfdom.pkg.OdfFileDom;

import java.util.function.Function;
import java.util.regex.Pattern;

import static java.lang.System.out;

public class Replacer {
  static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\$\\{\\{(\\w+)}}");

  static public void replaceAllInTable(OdfTable table, PlaceholderProcessor processor) {
    var rowCount = table.getRowElementList().size();
    var colCount = table.getColumnCount();

    for (int row = 0; row < rowCount; row++) {
      for (int col = 0; col < colCount; col++) {
        var cell = table.getCellByPosition(col, row);
        var content = cell.getDisplayText();
        var matcher = PLACEHOLDER_PATTERN.matcher(content);
        if (!content.isEmpty() && matcher.find()) {
          NodePrinter.prettyPrint(cell.getOdfElement());
          out.println(content);
          var replacement = processor.apply(matcher.group(1));
          out.println(replacement);

          if (replacement instanceof Replacement.Date date) {
            cell.setDateValue(date.toCalendar());
          } else if (replacement instanceof Replacement.Email email) {
            cell.setDisplayText(null);
            var textElement = cell.getOdfElement().getFirstChildElement();
            var linkElement = new TextAElement((OdfFileDom) textElement.getOwnerDocument());
            linkElement.setXlinkHrefAttribute("mailto:" + email.value());
            linkElement.setXlinkTypeAttribute(XlinkTypeAttribute.Value.SIMPLE.toString());
            linkElement.appendChild(textElement.getOwnerDocument().createTextNode(email.value()));
            textElement.appendChild(linkElement);
          } else if (replacement instanceof Replacement.Text text) {
            cell.setDisplayText(text.value());
          }

          NodePrinter.prettyPrint(cell.getOdfElement());
          // out.printf("%s;%s: %s%n", row, col, content);
        }
      }
    }
  }

  @FunctionalInterface
  public interface PlaceholderProcessor extends Function<String, @NotNull Replacement> {}
}
