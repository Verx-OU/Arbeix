package ee.verx.arbeix.placeholder;

import org.intellij.lang.annotations.MagicConstant;

import java.util.Calendar;
import java.util.GregorianCalendar;

public sealed interface Placeholder {
  record Text(String value) implements Placeholder {}
  record Email(String value) implements Placeholder {}
  record Date(int year, @MagicConstant(intValues = {Calendar.JANUARY, Calendar.FEBRUARY, Calendar.MARCH, Calendar.APRIL, Calendar.MAY, Calendar.JUNE, Calendar.JULY, Calendar.AUGUST, Calendar.SEPTEMBER, Calendar.OCTOBER, Calendar.NOVEMBER, Calendar.DECEMBER}) int month, int day) implements Placeholder {
    public Calendar toCalendar() {
      var date = GregorianCalendar.getInstance();
      date.set(year, month, day);
      return date;
    }
  }
  record None() implements Placeholder {}
}
