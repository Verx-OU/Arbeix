package ee.verx.arbeix.placeholder;

import static java.lang.System.out;

import ee.verx.arbeix.NodePrinter;
import java.util.regex.Pattern;
import org.jetbrains.annotations.NotNull;
import org.odftoolkit.odfdom.doc.table.OdfTable;
import org.odftoolkit.odfdom.dom.attribute.xlink.XlinkTypeAttribute;
import org.odftoolkit.odfdom.dom.element.text.TextAElement;
import org.odftoolkit.odfdom.pkg.OdfFileDom;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class Replacer {
  static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\$\\{\\{(\\*?)(\\w+)}}");

  public static void replaceAllInTable(OdfTable table, PlaceholderProcessor processor) {
    int repetitions = 0;
    boolean madeDuplicate = false;
    for (int row = 0; row < table.getRowElementList().size(); row++) {
      for (int col = 0; col < table.getColumnCount(); col++) {
        var cell = table.getCellByPosition(col, row);
        var content = cell.getDisplayText();
        var matcher = PLACEHOLDER_PATTERN.matcher(content);
        if (!content.isEmpty() && matcher.find()) {
          NodePrinter.prettyPrint(cell.getOdfElement());
          out.println(content);
          var repeated = !matcher.group(1).isEmpty();
          var replacement = processor.apply(matcher.group(2), repetitions);
          out.println(
              (madeDuplicate ? "(...)" : "") + (repeated ? "(REPEATED)" : "") + replacement);

          if (repeated && madeDuplicate && replacement instanceof Replacement.None) {
            cell.getTable().removeRowsByIndex(cell.getRowIndex(), 1);
            madeDuplicate = false;
            break;
          } else if (repeated) {
            var newRowReference =
                cell.getTable().insertRowsBefore(cell.getRowIndex() + 1, 1).get(0);
            var newRow = newRowReference.getOdfElement();
            NodeList children = newRow.getChildNodes();
            for (int i = children.getLength() - 1; i >= 0; i--) {
              Node child = children.item(i);
              if (child != null) {
                newRow.removeChild(child);
              }
            }
            cell.getTableRow().getOdfElement().cloneElement().moveChildrenTo(newRow);
            madeDuplicate = true;
          }

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
          } else if (replacement instanceof Replacement.Number number) {
            cell.setDoubleValue(number.value());
          }

          NodePrinter.prettyPrint(cell.getOdfElement());
          // out.printf("%s;%s: %s%n", row, col, content);
        }
      }

      if (madeDuplicate) repetitions++;
      else repetitions = 0;
    }
  }

  @FunctionalInterface
  public interface PlaceholderProcessor {
    Replacement apply(@NotNull String placeholder, int index);
  }
}
