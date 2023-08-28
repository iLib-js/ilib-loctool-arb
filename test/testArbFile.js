/*
 * testArbFile.js - test the arb file type handler object.
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

if (!ArbFile) {
    var ArbFile = require("../ArbFile.js");
    var ArbFileType = require("../ArbFileType.js");
    var CustomProject =  require("loctool/lib/CustomProject.js");
    var TranslationSet =  require("loctool/lib/TranslationSet.js");
    var ResourceString =  require("loctool/lib/ResourceString.js");
}

var p = new CustomProject({
    id: "app",
    type: "flutter",
    sourceLocale: "en-KR",
    resourceDirs: {
        "arb": "."
    },
    }, "./test/testfiles", {
    locales:["en-GB", "ko-KR"],
    jsonMap: {
        "mappings": {
            "**/intl_messages.arb": {
                "template": "[dir]/[localeDir]/[filename]"
            }
        }
    }
});

var sampleAppinfo = {
    "@@last_modified": "2023-08-22T15:04:08.215924",
    "_title": "SampleApp",
    "@_title": {
      "type": "text",
      "placeholders": {},
    }
}

var sampleAppinfo2 = {
    "@@last_modified": "2023-08-22T15:04:08.215924",
    "_title": "SampleApp",
    "@_title": {
      "type": "text",
      "placeholders": {},
    },
    "_bodyText": "You have pushed the button this many times:",
    "@_bodyText": {
      "type": "text",
      "placeholders": {}
    }
}

var arbft = new ArbFileType(p);

module.exports.arbfile = {
    testArbFileConstructor: function(test) {
        test.expect(1);

        var arbf = new ArbFile({project: p, type:arbft});
        test.ok(arbf);
        test.done();
    },
    testArbFileConstructorParams: function(test) {
        test.expect(1);

        var arbf = new ArbFile({
            project: p,
            type: arbft
        });

        test.ok(arbf);
        test.done();
    },
    testArbFileConstructorNoFile: function(test) {
        test.expect(1);

        var arbf = new ArbFile({
            project: p,
            pathName: undefined,
            type: arbft
        });
        test.ok(arbf);
        test.done();
    },
    
    testArbFileParseSimpleGetByKey: function(test) {
        test.expect(5);

        var arbf = new ArbFile({
            project: p,
            pathName: undefined,
            type: arbft
        });
        test.ok(arbf);
        arbf.parse(sampleAppinfo);

        var set = arbf.getTranslationSet();
        test.ok(set);

        var r = set.getBy({
            reskey: "_title"
        });
        test.ok(r);

        test.equal(r[0].getSource(), "SampleApp");
        test.equal(r[0].getKey(), "_title");

        test.done();
    },
    testArbFileParseSimpleGetByKey2: function(test) {
        test.expect(3);

        var arbf = new ArbFile({
            project: p,
            pathName: undefined,
            type: arbft
        });
        test.ok(arbf);
        arbf.parse(sampleAppinfo2);

        var set = arbf.getTranslationSet();
        test.ok(set);

        arbf.extract();

        var set = arbf.getTranslationSet();
        test.equal(set.size(), 2);
        test.done();

    },
    testArbFileParseMultipleWithKey: function(test) {
        test.expect(6);

        var arbf = new ArbFile({
            project: p,
            pathName: undefined,
            type: arbft
        });
        test.ok(arbf);

        arbf.parse('{"title":"Hello"}');

        var set = arbf.getTranslationSet();
        test.ok(set);

        var r = set.getBy({
            reskey: "title"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "Hello");
        test.ok(r[0].getAutoKey());
        test.equal(r[0].getKey(), "title");

        test.done();
    },
    testArbFileExtractFile: function(test) {
        test.expect(8);

        var arbf = new ArbFile({
            project: p,
            pathName: "./intl_messages.arb",
            type: arbft
        });
        test.ok(arbf);

        // should read the file
        arbf.extract();
        var set = arbf.getTranslationSet();
        test.equal(set.size(), 6);

        var r = set.getBySource("Increment");
        test.ok(r);
        test.equal(r.getSource(), "Increment");
        test.equal(r.getKey(), "_incrementButton");

        var r = set.getBy({
            reskey: "_incrementButton"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "Increment");
        test.equal(r[0].getKey(), "_incrementButton");

        test.done();
    },
        testArbFiledefaultPath: function(test) {
        test.expect(2);

        var arbf = new ArbFile({
            project: p,
            pathName: ".",
            type: arbft
        });
        test.ok(arbf);

        // should attempt to read the file and not fail
        arbf.extract();

        var set = arbf.getTranslationSet();
        test.equal(set.size(), 0);

        test.done();
    },
    testArbFileExtractUndefinedFile: function(test) {
        test.expect(2);

        var arbf = new ArbFile({
            project: p,
            pathName: undefined,
            type: arbft
        });
        test.ok(arbf);

        // should attempt to read the file and not fail
        arbf.extract();

        var set = arbf.getTranslationSet();
        test.equal(set.size(), 0);
        test.done();
    },
    testArbFileTest2: function(test) {
        test.expect(2);

        var arbf = new ArbFile({
            project: p,
            pathName: "./js/t2.js",
            type: arbft
        });
        test.ok(arbf);

        // should attempt to read the file and not fail
        arbf.extract();

        var set = arbf.getTranslationSet();
        test.equal(set.size(), 0);
        test.done();
    },
    testArbParse: function (test) {
        test.expect(5);
        var arbf = new ArbFile({
            project: p,
            type: arbft
        });
        test.ok(arbf);
        arbf.parse({
            "@@last_modified": "2023-08-22T15:04:08.215924",
            "_title": "Sample",
            "@_title": {
              "type": "text",
              "placeholders": {},
            }
        });
        var set = arbf.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("Sample");
        test.ok(r);
        test.equal(r.getSource(), "Sample");
        test.equal(r.getKey(), "_title");

        test.done();
    },
    testArbParseMultiple: function (test) {
        test.expect(6);
        var arbf = new ArbFile({
            project: p,
            type: arbft
        });
        test.ok(arbf);
        arbf.parse({
            "@@last_modified": "2023-08-22T15:04:08.215924",
            "_title": "Sample",
            "@_title": {
              "type": "text",
              "placeholders": {},
            },
           "_bodyText": "You have pushed the button this many times",
           "@_bodyText": {
             "type": "text",
             "placeholders": {}
            }
        });
        var set = arbf.getTranslationSet();
        test.ok(set);
        test.equal(set.size(), 2);

        var r = set.getBySource("You have pushed the button this many times");
        test.ok(r);
        test.equal(r.getSource(), "You have pushed the button this many times");
        test.equal(r.getKey(), "_bodyText");
        test.done();

    },
    testArbLocalzeText: function(test) {
        test.expect(2);
        var arbf = new ArbFile({
            project: p,
            type: arbft
        });
        test.ok(arbf);
        arbf.parse({
            "@@last_modified": "2023-08-22T15:04:08.215924",
            "_title": "Sample",
            "@_title": {
              "type": "text",
              "placeholders": {},
            }
        });
        var translations = new TranslationSet();
        var resource = new ResourceString({
            project: "app",
            source: "Sample",
            sourceLocale: "en-KR",
            key: "_title",
            target: "샘플",
            targetLocale: "ko-KR",
            datatype: "arb"
        })
        translations.add(resource);

        var actual = arbf.localizeText(translations, "ko-KR");
        var expected = '{\n' +
        '    "@@last_modified": "2023-08-22T15:04:08.215924",\n' +
        '    "_title": "샘플",\n' +
        '    "@_title": {\n' +
        '        "type": "text",\n' +
        '        "placeholders": {}\n' +
        '    },\n' +
        '    "@@locale": "ko"\n' +
        '}';
        test.equal(actual, expected);
        test.done();
    },

    testArbLocalzeTextMultiple: function(test) {
        test.expect(2);
        var arbf = new ArbFile({
            project: p,
            type: arbft
        });
        test.ok(arbf);
        arbf.parse({
            "@@last_modified": "2023-08-22T15:04:08.215924",
            "_title": "Sample",
            "@_title": {
              "type": "text",
              "placeholders": {},
            },
            "_hello": "Hello, {yourName}",
            "@_hello": {
              "description": "Say hello",
              "type": "text",
              "placeholders": {
                "yourName": {
                  "example": "Sparky"
                }
              }
            }
        });
        var translations = new TranslationSet();

        translations.add(new ResourceString({
            project: "app",
            source: "Sample",
            sourceLocale: "en-KR",
            key: "_title",
            target: "샘플",
            targetLocale: "ko-KR",
            datatype: "arb"
        }));

        translations.add(new ResourceString({
            project: "app",
            source: "Hello, {yourName}",
            sourceLocale: "en-KR",
            key: "_hello",
            target: "안녕하세요, {yourName}",
            targetLocale: "ko-KR",
            datatype: "arb"
        }));

        var actual = arbf.localizeText(translations, "ko-KR");
        var expected =
        '{\n' +
        '    "@@last_modified": "2023-08-22T15:04:08.215924",\n' +
        '    "_title": "샘플",\n' +
        '    "@_title": {\n' +
        '        "type": "text",\n' +
        '        "placeholders": {}\n' +
        '    },\n' +
        '    "_hello": "안녕하세요, {yourName}",\n' +
        '    "@_hello": {\n' +
        '        "description": "Say hello",\n' +
        '        "type": "text",\n' +
        '        "placeholders": {\n' +
        '            "yourName": {\n' +
        '                "example": "Sparky"\n' +
        '            }\n' +
        '        }\n' +
        '    },\n' +
        '    "@@locale": "ko"\n' +
        '}'
        test.equal(actual, expected);
        test.done();
    },
    testJSONResourceFileGetResourceFilePaths: function(test) {
        test.expect(193);
        var locales = ["af-ZA","am-ET","ar-AE","ar-BH","ar-DJ","ar-DZ","ar-EG","ar-IQ",
        "ar-JO","ar-KW","ar-LB","ar-LY","ar-MA","ar-MR","ar-OM","ar-QA","ar-SA","ar-SD",
        "ar-SY","ar-TN","ar-YE","as-IN","az-Latn-AZ","bg-BG","bn-IN","bs-Latn-BA","bs-Latn-ME",
        "cs-CZ","da-DK","de-AT","de-CH","de-DE","de-LU","el-CY","el-GR","en-AM","en-AU","en-AZ",
        "en-CA","en-CN","en-ET","en-GB","en-GE","en-GH","en-GM","en-HK","en-IE","en-IN","en-IS",
        "en-JP","en-KE","en-LK","en-LR","en-MM","en-MW","en-MX","en-MY","en-NG","en-NZ","en-PH",
        "en-PK","en-PR","en-RW","en-SD","en-SG","en-SL","en-TW","en-TZ","en-UG","en-US","en-ZA",
        "en-ZM","es-AR","es-BO","es-CA","es-CL","es-CO","es-CR","es-DO","es-EC","es-ES","es-GQ",
        "es-GT","es-HN","es-MX","es-NI","es-PA","es-PE","es-PH","es-PR","es-PY","es-SV","es-US",
        "es-UY","es-VE","et-EE","fa-AF","fa-IR","fi-FI","fr-BE","fr-BF","fr-BJ","fr-CA","fr-CD",
        "fr-CF","fr-CG","fr-CH","fr-CI","fr-CM","fr-GQ","fr-DJ","fr-DZ","fr-FR","fr-GA","fr-GN",
        "fr-LB","fr-LU","fr-ML","fr-RW","fr-SN","fr-TG","ga-IE","gu-IN","ha-Latn-NG","he-IL",
        "hi-IN","hr-HR","hr-ME","hu-HU","id-ID","is-IS","it-CH","it-IT","ja-JP","kk-Cyrl-KZ","km-KH",
        "kn-IN","ko-KR","ku-Arab-IQ","lt-LT","lv-LV","mk-MK","ml-IN","mn-Cyrl-MN","mr-IN","ms-MY",
        "ms-SG","nb-NO","nl-BE","nl-NL","or-IN","pa-IN","pa-PK","pl-PL","pt-AO","pt-BR","pt-GQ",
        "pt-CV","pt-PT","ro-RO","ru-BY","ru-GE","ru-KG","ru-KZ","ru-RU","ru-UA","si-LK","sk-SK",
        "sl-SI","sq-AL","sq-ME","sr-Latn-ME","sr-Latn-RS","sv-FI","sv-SE","sw-Latn-KE","ta-IN",
        "te-IN","th-TH","tr-AM","tr-AZ","tr-CY","tr-TR","uk-UA","ur-IN","ur-PK","uz-Latn-UZ","vi-VN",
        "zh-Hans-CN","zh-Hans-MY","zh-Hans-SG","zh-Hant-HK","zh-Hant-TW"];

        var expected = [
            "test/testfiles/intl_af.arb",
            "test/testfiles/intl_am.arb",
            "test/testfiles/intl_ar_AE.arb",
            "test/testfiles/intl_ar_BH.arb",
            "test/testfiles/intl_ar_DJ.arb",
            "test/testfiles/intl_ar_DZ.arb",
            "test/testfiles/intl_ar.arb",
            "test/testfiles/intl_ar_IQ.arb",
            "test/testfiles/intl_ar_JO.arb",
            "test/testfiles/intl_ar_KW.arb",
            "test/testfiles/intl_ar_LB.arb",
            "test/testfiles/intl_ar_LY.arb",
            "test/testfiles/intl_ar_MA.arb",
            "test/testfiles/intl_ar_MR.arb",
            "test/testfiles/intl_ar_OM.arb",
            "test/testfiles/intl_ar_QA.arb",
            "test/testfiles/intl_ar_SA.arb",
            "test/testfiles/intl_ar_SD.arb",
            "test/testfiles/intl_ar_SY.arb",
            "test/testfiles/intl_ar_TN.arb",
            "test/testfiles/intl_ar_YE.arb",
            "test/testfiles/intl_as.arb",
            "test/testfiles/intl_az.arb",
            "test/testfiles/intl_bg.arb",
            "test/testfiles/intl_bn_IN.arb",
            "test/testfiles/intl_bs.arb",
            "test/testfiles/intl_bs_Latn_ME.arb",
            "test/testfiles/intl_cs.arb",
            "test/testfiles/intl_da.arb",
            "test/testfiles/intl_de_AT.arb",
            "test/testfiles/intl_de_CH.arb",
            "test/testfiles/intl_de.arb",
            "test/testfiles/intl_de_LU.arb",
            "test/testfiles/intl_el_CY.arb",
            "test/testfiles/intl_el.arb",
            "test/testfiles/intl_en_AM.arb",
            "test/testfiles/intl_en_AU.arb",
            "test/testfiles/intl_en_AZ.arb",
            "test/testfiles/intl_en_CA.arb",
            "test/testfiles/intl_en_CN.arb",
            "test/testfiles/intl_en_ET.arb",
            "test/testfiles/intl_en_GB.arb",
            "test/testfiles/intl_en_GE.arb",
            "test/testfiles/intl_en_GH.arb",
            "test/testfiles/intl_en_GM.arb",
            "test/testfiles/intl_en_HK.arb",
            "test/testfiles/intl_en_IE.arb",
            "test/testfiles/intl_en_IN.arb",
            "test/testfiles/intl_en_IS.arb",
            "test/testfiles/intl_en_JP.arb",
            "test/testfiles/intl_en_KE.arb",
            "test/testfiles/intl_en_LK.arb",
            "test/testfiles/intl_en_LR.arb",
            "test/testfiles/intl_en_MM.arb",
            "test/testfiles/intl_en_MW.arb",
            "test/testfiles/intl_en_MX.arb",
            "test/testfiles/intl_en_MY.arb",
            "test/testfiles/intl_en_NG.arb",
            "test/testfiles/intl_en_NZ.arb",
            "test/testfiles/intl_en_PH.arb",
            "test/testfiles/intl_en_PK.arb",
            "test/testfiles/intl_en_PR.arb",
            "test/testfiles/intl_en_RW.arb",
            "test/testfiles/intl_en_SD.arb",
            "test/testfiles/intl_en_SG.arb",
            "test/testfiles/intl_en_SL.arb",
            "test/testfiles/intl_en_TW.arb",
            "test/testfiles/intl_en_TZ.arb",
            "test/testfiles/intl_en_UG.arb",
            "test/testfiles/intl_en.arb",
            "test/testfiles/intl_en_ZA.arb",
            "test/testfiles/intl_en_ZM.arb",
            "test/testfiles/intl_es_AR.arb",
            "test/testfiles/intl_es_BO.arb",
            "test/testfiles/intl_es_CA.arb",
            "test/testfiles/intl_es_CL.arb",
            "test/testfiles/intl_es_CO.arb",
            "test/testfiles/intl_es_CR.arb",
            "test/testfiles/intl_es_DO.arb",
            "test/testfiles/intl_es_EC.arb",
            "test/testfiles/intl_es.arb",
            "test/testfiles/intl_es_GQ.arb",
            "test/testfiles/intl_es_GT.arb",
            "test/testfiles/intl_es_HN.arb",
            "test/testfiles/intl_es_MX.arb",
            "test/testfiles/intl_es_NI.arb",
            "test/testfiles/intl_es_PA.arb",
            "test/testfiles/intl_es_PE.arb",
            "test/testfiles/intl_es_PH.arb",
            "test/testfiles/intl_es_PR.arb",
            "test/testfiles/intl_es_PY.arb",
            "test/testfiles/intl_es_SV.arb",
            "test/testfiles/intl_es_US.arb",
            "test/testfiles/intl_es_UY.arb",
            "test/testfiles/intl_es_VE.arb",
            "test/testfiles/intl_et.arb",
            "test/testfiles/intl_fa_AF.arb",
            "test/testfiles/intl_fa.arb",
            "test/testfiles/intl_fi.arb",
            "test/testfiles/intl_fr_BE.arb",
            "test/testfiles/intl_fr_BF.arb",
            "test/testfiles/intl_fr_BJ.arb",
            "test/testfiles/intl_fr_CA.arb",
            "test/testfiles/intl_fr_CD.arb",
            "test/testfiles/intl_fr_CF.arb",
            "test/testfiles/intl_fr_CG.arb",
            "test/testfiles/intl_fr_CH.arb",
            "test/testfiles/intl_fr_CI.arb",
            "test/testfiles/intl_fr_CM.arb",
            "test/testfiles/intl_fr_GQ.arb",
            "test/testfiles/intl_fr_DJ.arb",
            "test/testfiles/intl_fr_DZ.arb",
            "test/testfiles/intl_fr.arb",
            "test/testfiles/intl_fr_GA.arb",
            "test/testfiles/intl_fr_GN.arb",
            "test/testfiles/intl_fr_LB.arb",
            "test/testfiles/intl_fr_LU.arb",
            "test/testfiles/intl_fr_ML.arb",
            "test/testfiles/intl_fr_RW.arb",
            "test/testfiles/intl_fr_SN.arb",
            "test/testfiles/intl_fr_TG.arb",
            "test/testfiles/intl_ga.arb",
            "test/testfiles/intl_gu.arb",
            "test/testfiles/intl_ha.arb",
            "test/testfiles/intl_he.arb",
            "test/testfiles/intl_hi.arb",
            "test/testfiles/intl_hr.arb",
            "test/testfiles/intl_hr_ME.arb",
            "test/testfiles/intl_hu.arb",
            "test/testfiles/intl_id.arb",
            "test/testfiles/intl_is.arb",
            "test/testfiles/intl_it_CH.arb",
            "test/testfiles/intl_it.arb",
            "test/testfiles/intl_ja.arb",
            "test/testfiles/intl_kk.arb",
            "test/testfiles/intl_km.arb",
            "test/testfiles/intl_kn.arb",
            "test/testfiles/intl_ko.arb",
            "test/testfiles/intl_ku_Arab_IQ.arb",
            "test/testfiles/intl_lt.arb",
            "test/testfiles/intl_lv.arb",
            "test/testfiles/intl_mk.arb",
            "test/testfiles/intl_ml.arb",
            "test/testfiles/intl_mn.arb",
            "test/testfiles/intl_mr.arb",
            "test/testfiles/intl_ms.arb",
            "test/testfiles/intl_ms_SG.arb",
            "test/testfiles/intl_nb.arb",
            "test/testfiles/intl_nl_BE.arb",
            "test/testfiles/intl_nl.arb",
            "test/testfiles/intl_or.arb",
            "test/testfiles/intl_pa.arb",
            "test/testfiles/intl_pa_PK.arb",
            "test/testfiles/intl_pl.arb",
            "test/testfiles/intl_pt_AO.arb",
            "test/testfiles/intl_pt.arb",
            "test/testfiles/intl_pt_GQ.arb",
            "test/testfiles/intl_pt_CV.arb",
            "test/testfiles/intl_pt_PT.arb",
            "test/testfiles/intl_ro.arb",
            "test/testfiles/intl_ru_BY.arb",
            "test/testfiles/intl_ru_GE.arb",
            "test/testfiles/intl_ru_KG.arb",
            "test/testfiles/intl_ru_KZ.arb",
            "test/testfiles/intl_ru.arb",
            "test/testfiles/intl_ru_UA.arb",
            "test/testfiles/intl_si.arb",
            "test/testfiles/intl_sk.arb",
            "test/testfiles/intl_sl.arb",
            "test/testfiles/intl_sq.arb",
            "test/testfiles/intl_sq_ME.arb",
            "test/testfiles/intl_sr_Latn_ME.arb",
            "test/testfiles/intl_sr_Latn_RS.arb",
            "test/testfiles/intl_sv_FI.arb",
            "test/testfiles/intl_sv.arb",
            "test/testfiles/intl_sw_Latn_KE.arb",
            "test/testfiles/intl_ta.arb",
            "test/testfiles/intl_te.arb",
            "test/testfiles/intl_th.arb",
            "test/testfiles/intl_tr_AM.arb",
            "test/testfiles/intl_tr_AZ.arb",
            "test/testfiles/intl_tr_CY.arb",
            "test/testfiles/intl_tr.arb",
            "test/testfiles/intl_uk.arb",
            "test/testfiles/intl_ur_IN.arb",
            "test/testfiles/intl_ur.arb",
            "test/testfiles/intl_uz.arb",
            "test/testfiles/intl_vi.arb",
            "test/testfiles/intl_zh.arb",
            "test/testfiles/intl_zh_Hans_MY.arb",
            "test/testfiles/intl_zh_Hans_SG.arb",
            "test/testfiles/intl_zh_Hant_HK.arb",
            "test/testfiles/intl_zh_Hant_TW.arb"
        ];

        for (var i=0; i<locales.length;i++) {
            jsrf = new ArbFile({
                project: p,
                pathName: "./test/testfiles/intl_messages.arb",
                type: arbft,
                locale: locales[i]
            });
            test.equal(jsrf.getLocalizedPath(locales[i]), expected[i]);
        }
        test.done();
    },
    testJSONResourceFileGetResourceFilePathsSimple: function(test) {
        test.expect(10);
        var locales = ["af-ZA","am-ET","ar-AE","ar-BH","ar-DJ","ar-DZ","ar-EG","ar-IQ",
        "ar-JO","ar-KW"];

        var expected = [
            "intl_af.arb",
            "intl_am.arb",
            "intl_ar_AE.arb",
            "intl_ar_BH.arb",
            "intl_ar_DJ.arb",
            "intl_ar_DZ.arb",
            "intl_ar.arb",
            "intl_ar_IQ.arb",
            "intl_ar_JO.arb",
            "intl_ar_KW.arb",
        ];

        for (var i=0; i<locales.length;i++) {
            jsrf = new ArbFile({
                project: p,
                pathName: "intl_messages.arb",
                type: arbft,
                locale: locales[i]
            });
            test.equal(jsrf.getLocalizedPath(locales[i]), expected[i]);
        }
        test.done();
    },
    testJSONResourceFileGetResourceFullFilePathsSimple: function(test) {
        test.expect(10);
        var locales = ["af-ZA","am-ET","ar-AE","ar-BH","ar-DJ","ar-DZ","ar-EG","ar-IQ",
        "ar-JO","ar-KW"];

        var expected = [
            "test/testfiles/intl_af.arb",
            "test/testfiles/intl_am.arb",
            "test/testfiles/intl_ar_AE.arb",
            "test/testfiles/intl_ar_BH.arb",
            "test/testfiles/intl_ar_DJ.arb",
            "test/testfiles/intl_ar_DZ.arb",
            "test/testfiles/intl_ar.arb",
            "test/testfiles/intl_ar_IQ.arb",
            "test/testfiles/intl_ar_JO.arb",
            "test/testfiles/intl_ar_KW.arb",
        ];

        for (var i=0; i<locales.length;i++) {
            jsrf = new ArbFile({
                project: p,
                pathName: "intl_messages.arb",
                type: arbft,
                locale: locales[i]
            });
            test.equal(jsrf.getfullLocalizedPath(locales[i]), expected[i]);
        }
        test.done();
    },
    testJSONResourceFileGetResourceFilePathsWithTranslations: function(test) {
        test.expect(5);
        var arbf = new ArbFile({
            project: p,
            type: arbft
        });
        test.ok(arbf);
        arbf.parse({
            "@@last_modified": "2023-08-22T15:04:08.215924",
            "_title": "checked",
            "@_title": {
              "type": "text",
              "placeholders": {},
            }
        });
        var translations = new TranslationSet();
        var resource = new ResourceString({
            project: "app",
            source: "checked",
            sourceLocale: "en-KR",
            key: "_title",
            target: "sélectionné",
            targetLocale: "fr-FR",
            datatype: "arb"
        })
        translations.add(resource);

        var resource2 = new ResourceString({
            project: "app",
            source: "checked",
            sourceLocale: "en-KR",
            key: "_title",
            target: "coché",
            targetLocale: "fr-CA",
            datatype: "arb"
        })
        translations.add(resource2);

        var actual = arbf.localizeText(translations, "fr-FR");
        var expected = 
        '{\n' +
        '    "@@last_modified": "2023-08-22T15:04:08.215924",\n' +
        '    "_title": "sélectionné",\n' +
        '    "@_title": {\n' +
        '        "type": "text",\n' +
        '        "placeholders": {}\n' +
        '    },\n' +
        '    "@@locale": "fr"\n' +
        '}';
        test.equal(actual, expected);
        var actual2 = arbf.localizeText(translations, "fr-CA");
        var expected2 = '{\n' +
        '    "@@last_modified": "2023-08-22T15:04:08.215924",\n' +
        '    "_title": "coché",\n' +
        '    "@_title": {\n' +
        '        "type": "text",\n' +
        '        "placeholders": {}\n' +
        '    },\n' +
        '    "@@locale": "fr_CA"\n' +
        '}';
        test.equal(actual2, expected2);

        test.equal(arbf.getLocalizedPath("fr-FR"), "intl_fr.arb");
        test.equal(arbf.getLocalizedPath("fr-CA"), "intl_fr_CA.arb");
        test.done();
    }
};