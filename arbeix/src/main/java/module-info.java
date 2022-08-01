module ee.verx.arbeix {
  exports ee.verx.arbeix.placeholder;

  opens ee.verx.arbeix.placeholder;

  requires java.xml;
  requires org.jetbrains.annotations;
  requires org.odftoolkit.odfdom;
  requires com.fasterxml.jackson.databind;
}
