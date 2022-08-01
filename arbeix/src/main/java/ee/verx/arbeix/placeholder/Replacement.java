package ee.verx.arbeix.placeholder;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.Calendar;
import java.util.GregorianCalendar;
import org.jetbrains.annotations.NotNull;

public sealed interface Replacement {
  record Text(String value) implements Replacement {
    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public Text {}
  }

  record Number(double value) implements Replacement {
    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public Number {}

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public Number(int integer) {
      this((double) integer);
    }
  }

  record Email(String value) implements Replacement {
    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public Email {}
  }

  record Date(int year, int month, int day) implements Replacement {
    public @NotNull Calendar toCalendar() {
      var date = GregorianCalendar.getInstance();
      //noinspection MagicConstant
      date.set(year, month - 1, day);
      return date;
    }
  }

  record None() implements Replacement {}
}
