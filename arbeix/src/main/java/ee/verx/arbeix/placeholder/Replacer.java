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

  static ColRow getAbsoluteCellAddress(int colIndex, int rowIndex) {
    int remainder;
    int multiple = colIndex;
    StringBuilder cellRange = new StringBuilder();
    while (multiple != 0) {
      multiple = colIndex / 26;
      remainder = colIndex % 26;
      char c;
      if (multiple == 0) {
        c = (char) ('A' + remainder);
      } else {
        c = (char) ('A' + multiple - 1);
      }
      cellRange.append(c);
      colIndex = remainder;
    }
    return new ColRow(cellRange.toString(), rowIndex + 1 + "");
  }

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
          boolean noReplacement = (replacement == null) || (replacement instanceof Replacement.None);
          out.println(
              (madeDuplicate ? "(...)" : "") + (repeated ? "(REPEATED)" : "") + replacement);

          if (repeated && noReplacement) {
            table.removeRowsByIndex(cell.getRowIndex(), 1);
            madeDuplicate = false;
            break;
          } else if (repeated) {
            var newRowReference = table.insertRowsBefore(cell.getRowIndex() + 1, 1).get(0);
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
          } else if (replacement instanceof Replacement.Formula formula) {
            var cellAddress = getAbsoluteCellAddress(cell.getColumnIndex(), cell.getRowIndex());
            cell.setStringValue(null);
            cell.setFormula(
                formula
                    .value()
                    .replaceAll(Pattern.quote("${{ROW}}"), cellAddress.row)
                    .replaceAll(Pattern.quote("${{COL}}"), cellAddress.col));
          } else {
            cell.setDisplayText(null);
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

  record ColRow(String col, String row) {}
}
