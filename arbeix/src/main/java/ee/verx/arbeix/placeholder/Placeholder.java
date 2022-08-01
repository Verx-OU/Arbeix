package ee.verx.arbeix.placeholder;

import org.jetbrains.annotations.Contract;
import org.jetbrains.annotations.NotNull;

public enum Placeholder {
  CL_NAME("KLIENT_NIMI", Type.TEXT),
  CL_COMPANY("KLIENT_ETTEVOTE", Type.TEXT),
  CL_MAIL("KLIENT_TELEFON", Type.EMAIL),
  CL_TEL("KLIENT_EKIRI", Type.TEXT),
  CL_OBJ("KLIENT_OBJEKT", Type.TEXT),
  CL_DATE("KUUPAEV", Type.DATE),
  NR("HINNAPAKKUMINE_NR", Type.DATE);

  final @NotNull String localName;
  final @NotNull Type type;

  @Contract(pure = true)
  Placeholder(@NotNull String localName, @NotNull Type type) {
    this.localName = localName;
    this.type = type;
  }

  @Contract(pure = true)
  public @NotNull String localName() {
    return localName;
  }

  @Contract(pure = true)
  public @NotNull Type type() {
    return type;
  }
}
