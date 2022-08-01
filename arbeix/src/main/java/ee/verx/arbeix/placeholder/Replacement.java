package ee.verx.arbeix.placeholder;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import org.jetbrains.annotations.NotNull;

import java.util.Calendar;
import java.util.GregorianCalendar;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include= JsonTypeInfo.As.PROPERTY, property="type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = Replacement.Text.class, name = "text"),
        @JsonSubTypes.Type(value = Replacement.Email.class, name = "email"),
        @JsonSubTypes.Type(value = Replacement.Date.class, name = "date")})
public sealed interface Replacement {
  record Text(String value) implements Replacement {}
  record Email(String value) implements Replacement {}
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
