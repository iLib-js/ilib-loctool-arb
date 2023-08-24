/*
 * ArbFile.js - plugin to extract resources from a arb code file
 *
 * Copyright (c) 2023 JEDLSoft
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fs = require("fs");
var path = require("path");
var Utils = require("loctool/lib/utils.js");
var ResourceString = require("loctool/lib/ResourceString.js");
var PseudoFactory = require("loctool/lib/PseudoFactory.js");

/**
 * Create a new arb file with the given path name and within
 * the given project.
 *
 * @param {Project} project the project object
 * @param {String} pathName path to the file relative to the root
 * of the project file
 * @param {FileType} type the file type of this instance
 */
var ArbFile = function(props) {
    this.project = props.project;
    this.pathName = props.pathName;
    this.datatype = "arb";
    this.API = props.project.getAPI();

    this.baseLocale = Utils.isBaseLocale(props.locale);
    this.type = props.type;
    this.set = this.API.newTranslationSet(this.project ? this.project.sourceLocale : "zxx-XX");
    this.logger = this.API.getLogger("loctool.plugin.ArbFile");
    this.mapping = this.type.getMappings(this.pathName);
};

/**
 * Unescape the string to make the same string that would be
 * in memory in the target programming language.
 *
 * @static
 * @param {String} string the string to unescape
 * @returns {String} the unescaped string
 */
ArbFile.unescapeString = function(string) {
    var unescaped = string;

    unescaped = unescaped.
        replace(/\\\\n/g, "").                // line continuation
        replace(/\\\n/g, "").                // line continuation
        replace(/^\\\\/, "\\").             // unescape backslashes
        replace(/([^\\])\\\\/g, "$1\\").
        replace(/^\\'/, "'").               // unescape quotes
        replace(/([^\\])\\'/g, "$1'").
        replace(/^\\"/, '"').
        replace(/([^\\])\\"/g, '$1"');

    return unescaped;
};

/**
 * Clean the string to make a resource name string. This means
 * removing leading and trailing white space, compressing
 * whitespaces, and unescaping characters. This changes
 * the string from what it looks like in the source
 * code but increases matching.
 *
 * @static
 * @param {String} string the string to clean
 * @returns {String} the cleaned string
 */
ArbFile.cleanString = function(string) {
    var unescaped = ArbFile.unescapeString(string);

    unescaped = unescaped.
        replace(/\\[btnfr]/g, " ").
        replace(/[ \n\t\r\f]+/g, " ").
        trim();

    return unescaped;
};

/**
 * Make a new key for the given string. This must correspond
 * exactly with the code in file so that the
 * resources match up. See the class IResourceBundle in
 * this project under the directory for the corresponding
 * code.
 *
 * @private
 * @param {String} source the source string to make a resource
 * key for
 * @returns {String} a unique key for this string
 */
ArbFile.prototype.makeKey = function(source) {
    return ArbFile.unescapeString(source);
};

/**
 * Parse the data string looking for the localizable strings and add them to the
 * project's translation set.
 * @param {String} data the string to parse
 */
ArbFile.prototype.parse = function(data) {
    this.logger.debug("Extracting strings from " + this.pathName);

    this.parsedData = data;

    if (typeof data !== "object") {
        this.parsedData = JSON.parse(data);
    }

    for (var property in this.parsedData) {
        if (property[0] !== '@') {
            var r = this.API.newResource({
                resType: "string",
                project: this.project.getProjectId(),
                key: ArbFile.unescapeString(property),
                sourceLocale: this.project.sourceLocale,
                source: ArbFile.cleanString(this.parsedData[property]),
                autoKey: true,
                pathName: this.pathName,
                state: "new",
                comment: undefined,
                datatype: this.datatype,
                index: this.resourceIndex++
            });
            this.set.add(r);
        } else {
            this.logger.debug("[" + property + "] string is not for the translation.");
        }
    }
};

/**
 * Extract all the localizable strings from the arb file and add them to the
 * project's translation set.
 */
ArbFile.prototype.extract = function() {
    this.logger.debug("Extracting strings from " + this.pathName);
    if (this.pathName) {
        var p = path.join(this.project.root, this.pathName);
        try {
            var data = fs.readFileSync(p, "utf8");
            if (data) {
                this.parse(data);
            }
        } catch (e) {
            this.logger.warn("Could not read file: " + p);
        }
    }
};

/**
 * Return the set of resources found in the current arb file.
 *
 * @returns {TranslationSet} The set of resources found in the
 * current arb file.
 */
ArbFile.prototype.getTranslationSet = function() {
    return this.set;
}

// we don't localize or write arb source files
ArbFile.prototype.write = function() {};

/**
 * Return the location on disk where the version of this file localized
 * for the given locale should be written.
 * @param {String] locale the locale spec for the target locale
 * @returns {String} the localized path name
 */
ArbFile.prototype.getLocalizedPath = function(locale) {
    var mapping = this.mapping || this.type.getMappings(this.pathName || "") || this.type.getDefaultMapping();
    
    var splitLocale = locale.split("-");
    this.baseLocale = Utils.isBaseLocale(locale);
    var resDir = this.project.getResourceDirs("arb")[0] || ".";
    var lo = locale;

    if (this.baseLocale) {
        lo = splitLocale[0];
    }
    var path = this.API.utils.formatPath(mapping.template, {
        sourcepath: this.pathName,
        resourceDir: resDir,
        locale: lo
    });
    return path;
};

ArbFile.prototype.getfullLocalizedPath = function(locale) {
    var respath = this.getLocalizedPath(locale);
    return path.join(this.project.target, respath);
}

ArbFile.prototype._addnewResource = function(text, key, locale) {
    var newres = this.API.newResource({
        resType: "string",
        project: this.project.getProjectId(),
        key: this.makeKey(this.API.utils.escapeInvalidChars(text)),
        sourceLocale: this.project.getSourceLocale(),
        source: this.API.utils.escapeInvalidChars(text),
        targetLocale: locale,
        target: this.API.utils.escapeInvalidChars(text),
        reskey: key,
        state: "new",
        datatype: this.datatype
    });
    return newres;
}

ArbFile.prototype._getBaseTranslation = function(locale, translations, tester) {
    if (!locale) return;
    var langDefaultLocale = Utils.getBaseLocale(locale);
    var baseTranslation;
    if (langDefaultLocale === locale) {
        langDefaultLocale = 'en-US'; // language default locale need to compare with root data
    }

    if (locale !== 'en-US') {
        var hashkey = tester.hashKeyForTranslation(langDefaultLocale);
        var translated = translations.getClean(hashkey);
        if (translated) {
            baseTranslation = translated.target;
        }
    }
    return baseTranslation;
}

/**
 * Localize the text of the current file to the given locale and return
 * the results.
 *
 * @param {TranslationSet} translations the current set of translations
 * @param {String} locale the locale to translate to
 * @returns {String} the localized text of this file
 */
ArbFile.prototype.localizeText = function(translations, locale) {
    var output = this.parsedData;
    var stringifyOuput = "";
    var baseTranslation;
    var customInheritLocale;
    for (var property in this.parsedData) {
        if (property[0] !== '@') {
            var text = this.parsedData[property];
            var key = this.makeKey(this.API.utils.escapeInvalidChars(property));
            var tester = this.API.newResource({
                resType: "string",
                project: this.project.getProjectId(),
                sourceLocale: this.project.getSourceLocale(),
                reskey: key,
                datatype: this.datatype
            });
            var hashkey = tester.hashKeyForTranslation(locale);

            var translated = translations.getClean(hashkey);
            customInheritLocale = this.project.getLocaleInherit(locale);
            baseTranslation = key;
            
            if (!this.project.settings.nopseudo && ((this.project.settings[this.datatype] === undefined) ||
                (this.project.settings[this.datatype] &&
                !(this.project.settings[this.datatype].disablePseudo === true))) &&
                PseudoFactory.isPseudoLocale(locale, this.project)){
                output[property] = this.type.pseudos[locale].getString(key);
            } else {
                if (translated) {
                    baseTranslation = this._getBaseTranslation(locale, translations, tester);
                    if (baseTranslation !== translated.target) {
                        output[property] = translated.target;
                    }
                } else if (!translated && this.isloadCommonData){
                    var comonDataKey = ResourceString.hashKey(this.commonPrjName, locale, tester.getKey(), this.commonPrjType, tester.getFlavor());
                    translated = translations.getClean(comonDataKey);
                    if (translated) {
                        baseTranslation = this._getBaseTranslation(locale, translations, tester);
                        if (baseTranslation !== translated.target) {
                            output[property] = translated.target;
                        }
                    } else if (!translated && customInheritLocale) {
                        var hashkey2 = tester.hashKeyForTranslation(customInheritLocale);
                        var translated2 = translations.getClean(hashkey2);
                        if (translated2) {
                            baseTranslation = this._getBaseTranslation(locale, translations, tester);
                            if (baseTranslation !== translated2.target) {
                                output[property] = translated2.target;
                            }
                        } else {
                            this.logger.trace("New string found: " + text);
                            var r  = this._addnewResource(text, key, locale);
                            this.type.newres.add(r);
                        }
                    } else {
                        this.logger.trace("New string found: " + text);
                        var r  = this._addnewResource(text, key, locale);
                        this.type.newres.add(r);
                    }
                } else if(!translated && customInheritLocale) {
                    var hashkey2 = tester.hashKeyForTranslation(customInheritLocale);
                    var translated2 = translations.getClean(hashkey2);
                    if (translated2) {
                        baseTranslation = translated2.target;
                        output[property] = translated2.target;
                    } else {
                        this.logger.trace("New string found: " + text);
                        var r  = this._addnewResource(text, key, locale);
                        this.type.newres.add(r);
                    }
                } else {
                    this.logger.trace("New string found: " + text);
                    var r  = this._addnewResource(text, key, locale);
                    this.type.newres.add(r);
                }
           }
        }
    }

    if (output) {
        stringifyOuput = JSON.stringify(output, true, 4);
    }

    return stringifyOuput;
}

/**
  * Localize the contents of this arb file and write out the
  * localized arb file to a different file path.
  *
  * @param {TranslationSet} translations the current set of
  * translations
  * @param {Array.<String>} locales array of locales to translate to
  */
ArbFile.prototype.localize = function(translations, locales) {
    // don't localize if there is no text

    for (var i=0; i < locales.length; i++) {
       if (!this.project.isSourceLocale(locales[i])) {
            var translatedOutput = this.localizeText(translations, locales[i]);
            if (translatedOutput !== "{}") {
                var pathName = this.getLocalizedPath(locales[i]);
                var d = path.dirname(pathName);
                this.API.utils.makeDirs(d);
                fs.writeFileSync(pathName, translatedOutput, "utf-8");
            }
       }
    }
};

module.exports = ArbFile;