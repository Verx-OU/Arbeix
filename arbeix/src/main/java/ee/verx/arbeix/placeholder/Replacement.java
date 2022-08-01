package ee.verx.arbeix.placeholder;

import org.jetbrains.annotations.NotNull;

import java.util.Calendar;
import java.util.GregorianCalendar;

public sealed interface Replacement {
  record Text(String value) implements Replacement {}
  record Email(String value) implements Replacement {}
  record Date(int year, int month, int day) implements Replacement {
    public @NotNull Calendar toCalendar() {
      var date = GregorianCalendar.getInstance();
      date.set(year, month, day);
      return date;
    }
  }
  record None() implements Replacement {}
}
