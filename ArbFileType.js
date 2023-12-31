/*
 * ArbFileType.js - Represents a collection of arb files
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

var path = require("path");
var mm = require("micromatch");
var ArbFile = require("./ArbFile.js");

var ArbFileType = function(project) {
    this.type = "arb";
    this.resourceType = "arb";
    this.project = project;
    this.extensions = [".arb"];
    this.datatype = "arb";
    this.names = ["intl_messages"];

    this.API = project.getAPI();
    this.logger = this.API.getLogger("loctool.plugin.ArbFileType");
    this.extracted = this.API.newTranslationSet(project.getSourceLocale());
    this.newres = this.API.newTranslationSet(project.getSourceLocale());
    this.pseudo = this.API.newTranslationSet(project.getSourceLocale());

    // generate all the pseudo bundles we'll need
    if (project.pseudoLocale && Array.isArray(project.pseudoLocale)) {
        this.pseudos = {};
        project.pseudoLocale && project.pseudoLocale.forEach(function(locale) {
            var pseudo = this.API.getPseudoBundle(locale, this, project);
            if (pseudo) {
                this.pseudos[locale] = pseudo;
            }
        }.bind(this));
    }
    if (project.pseudoLocales && typeof project.pseudoLocales == 'object') {
        this.pseudos = {};
        for (locale in project.pseudoLocales) {
            var pseudo = this.API.getPseudoBundle(locale, this, project);
            if (pseudo) {
                this.pseudos[locale] = pseudo;
            }
        }
    }
};

var defaultMappings = {
    "**/intl_messages.arb": {
        "template": "[dir]/intl_[localeUnder].arb"
    }
}
/**
 * Return the mapping corresponding to this path.
 * @param {String} pathName the path to check
 * @returns {Object} the mapping object corresponding to the
 * path or undefined if none of the mappings match
 */
ArbFileType.prototype.getMappings = function(pathName) {
    if (typeof(pathName) === "undefined") {
        return undefined;
    }
    var mappings, match;
    var arbMapSettings = this.project.settings && this.project.settings.arbMap;
    if (arbMapSettings) {
        mappings = arbMapSettings.mappings || defaultMappings;
        var patterns = Object.keys(mappings);

        if (patterns) {
            match = patterns.find(function(pattern) {
                return mm.isMatch(pathName, pattern);
            });
        }
    }
    return match && mappings[match];
}

ArbFileType.prototype.getDefaultMapping = function() {
    return defaultMappings["**/intl_messages.arb"];
}

/**
 * Return true if the given path is a appinfo.json or qcardinfo.json file and is handled
 * by the current file type.
 *
 * @param {String} pathName path to the file being questions
 * @returns {boolean} true if the path is a appinfo.json or qcardinfo.json file, or false
 * otherwise
 */
ArbFileType.prototype.handles = function(pathName) {
    this.logger.debug("ArbFileTyp handles " + pathName + "?");
    if (!pathName) return false;
    
    var file = path.basename(pathName, ".arb");
    ret = (this.names.indexOf(file) !== -1) ? true: false;
    
    return ret;
};

ArbFileType.prototype.name = function() {
    return "Arb File Type";
};

ArbFileType.prototype.getResourceTypes = function() {
    return {};
}

/**
 * Write out the aggregated resources for this file type. In
 * some cases, the string are written out to a common resource
 * file, and in other cases, to a type-specific resource file.
 * In yet other cases, nothing is written out, as the each of
 * the files themselves are localized individually, so there
 * are no aggregated strings.
 */
ArbFileType.prototype.write = function(translations, locales) {
    // templates are localized individually, so we don't have to
    // write out the resources
};

ArbFileType.prototype.newFile = function(path) {
    return new ArbFile({
        project: this.project,
        pathName: path,
        type: this
    });
};

ArbFileType.prototype.getDataType = function() {
    return this.datatype;
};

/**
 * Return the translation set containing all of the extracted
 * resources for all instances of this type of file. This includes
 * all new strings and all existing strings. If it was extracted
 * from a source file, it should be returned here.
 *
 * @returns {TranslationSet} the set containing all of the
 * extracted resources
 */
ArbFileType.prototype.getExtracted = function() {
    return this.extracted;
};

/**
 * Add the contents of the given translation set to the extracted resources
 * for this file type.
 *
 * @param {TranslationSet} set set of resources to add to the current set
 */
ArbFileType.prototype.addSet = function(set) {
    this.extracted.addSet(set);
};

/**
 * Return the translation set containing all of the new
 * resources for all instances of this type of file.
 *
 * @returns {TranslationSet} the set containing all of the
 * new resources
 */
ArbFileType.prototype.getNew = function() {
    return this.newres;
};

/**
 * Return the translation set containing all of the pseudo
 * localized resources for all instances of this type of file.
 *
 * @returns {TranslationSet} the set containing all of the
 * pseudo localized resources
 */
ArbFileType.prototype.getPseudo = function() {
    return this.pseudo;
};

/**
 * Ensure that all resources collected so far have a pseudo translation.
 */
ArbFileType.prototype.generatePseudo = function(locale, pb) {
    var resources = this.extracted.getBy({
        sourceLocale: pb.getSourceLocale()
    });
    this.logger.trace("Found " + resources.length + " source resources for " + pb.getSourceLocale());

    resources.forEach(function(resource) {
        this.logger.trace("Generating pseudo for " + resource.getKey());
        var res = resource.generatePseudo(locale, pb);
        if (res && res.getSource() !== res.getTarget()) {
            this.pseudo.add(res);
        }
    }.bind(this));
};

/**
 * Return the list of file name extensions that this plugin can
 * process.
 *
 * @returns {Array.<string>} the list of file name extensions
 */
ArbFileType.prototype.getExtensions = function() {
    return this.extensions;
};

module.exports = ArbFileType;
