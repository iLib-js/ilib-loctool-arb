# ilib-loctool-arb
An ilib loctool plugin to parse and localize arb files.

## Configuration

By default, plugin will localize source `intl_messages.arb` file.   
e.g. `/asset/l10n/intl_messages.arb`, and write localized file
to a same location with name `intl_[locale].arb`   
e.g. `/asset/l10n/intl_es.arb`.


## ARB File
[ARB - Application Resource Bundle](https://github.com/google/app-resource-bundle/wiki/ApplicationResourceBundleSpecification) is a file format for localization basedon JSON with
the resource entries encoded as JSON object. Each object consists of a resource key with an
optional attribute. ARB files are used to localize apps build with [Flutter](https://flutter.dev/).


###  intl_messages.arb file
The `intl_messages.arb` file is generated `extract_to_arb.dart` program provided by [intl_translation](https://pub.dev/packages/intl_translation)

Example file:
```json
{
  "@@last_modified": "2023-08-28T13:51:31.807702",
  "_title": "Hello",
  "@_title": {
    "type": "text",
    "placeholders": {}
  },
  "_incrementButton": "Thank you",
  "@_incrementButton": {
    "type": "text",
    "placeholders": {}
  },
}
```

## License
Copyright © 2023 JEDLSoft

This plugin is license under Apache2. See the [LICENSE](./LICENSE)
file for more details.

## Release Notes

v1.0.0
* Implement for [ARB](https://github.com/google/app-resource-bundle/wiki/ApplicationResourceBundleSpecification) file type of localization.
  *  It localize the `intl_messages.arb` file which is the result of `extract_to_arb.dart` program provided by [intl_translation](https://pub.dev/packages/intl_translation)