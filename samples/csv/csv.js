var Paths = Packages.java.nio.file.Paths;
var Charset = Packages.java.nio.charset.Charset;
var commons_csv = new JavaImporter(org.apache.commons.csv);

with (commons_csv) {
  var charset = Charset.forName("US-ASCII");
  var file = Paths.get("sample.csv").toFile();
  var format = CSVFormat.EXCEL.withHeader().withIgnoreSurroundingSpaces();
  var records = CSVParser.parse(file, charset, format);
  for each (record in records) {
    var _date = record.get("Date");
    var _close = record.get("Close");
    var _volume = record.get("Volume");
    print("Date: ${_date}, Close: ${_close}, Volume: ${_volume}");
  }
}
