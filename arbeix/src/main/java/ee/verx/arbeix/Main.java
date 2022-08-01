package ee.verx.arbeix;

import ee.verx.arbeix.placeholder.Placeholder;
import ee.verx.arbeix.placeholder.Replacer;
import org.odftoolkit.odfdom.doc.OdfSpreadsheetDocument;

import java.util.Calendar;
import java.util.Map;

public class Main {

  public static void main(String[] args) throws Exception {
    @SuppressWarnings("SpellCheckingInspection")
    var examplePlaceholders =
        Map.ofEntries(
            Map.entry("KLIENT_NIMI", new Placeholder.Text("Peeter Oja")),
            Map.entry("KLIENT_ETTEVOTE", new Placeholder.Text("Eraisik")),
            Map.entry("KLIENT_TELEFON", new Placeholder.Text("+372 5555 555")),
            Map.entry("KLIENT_EKIRI", new Placeholder.Email("email@gmail.com")),
            Map.entry("KLIENT_OBJEKT", new Placeholder.Text("Tamsalu")),
            Map.entry("KUUPAEV", new Placeholder.Date(2020, Calendar.MAY, 11)),
            Map.entry("HINNAPAKKUMINE_NR", new Placeholder.Text("123456")));

    try (var ods = OdfSpreadsheetDocument.loadDocument(args[0])) {
      var tables = ods.getSpreadsheetTables();
      Replacer.replaceAllInTable(
          tables.get(0), i -> examplePlaceholders.getOrDefault(i, new Placeholder.None()));
      ods.save(args[1]);
    }
  }
}
