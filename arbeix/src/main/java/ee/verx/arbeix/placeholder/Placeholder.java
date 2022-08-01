package ee.verx.arbeix.placeholder;

import org.jetbrains.annotations.Contract;
import org.jetbrains.annotations.NotNull;

@SuppressWarnings("SpellCheckingInspection")
public enum Placeholder {
  CL_NAME("KLIENT_NIMI", Type.TEXT),
  CL_COMPANY("KLIENT_ETTEVOTE", Type.TEXT),
  CL_TEL("KLIENT_TELEFON", Type.TEXT),
  CL_MAIL("KLIENT_EKIRI", Type.EMAIL),
  CL_OBJ("KLIENT_OBJEKT", Type.TEXT),
  CL_DATE("KUUPAEV", Type.DATE),

  NR("HINNAPAKKUMINE_NR", Type.TEXT),

  MT_NAME("M_NIMI", Type.TEXT),
  MT_UNIT("M_MU", Type.TEXT),
  MT_COUNT("M_MAHT", Type.NUMBER),
  MT_PRICE("M_HIND", Type.NUMBER),
  MT_PRICE_FORMULA("M_HIND_VALEM", Type.FORMULA),
  MT_TOTAL_FORMULA("M_MAKSUMUS_VALEM", Type.FORMULA),
  MT_PROFIT("M_KASUM", Type.NUMBER),
  MT_VENDOR("M_MUUA", Type.TEXT),
  ;

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
