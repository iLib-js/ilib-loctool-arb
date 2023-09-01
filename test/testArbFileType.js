/*
 * testArbFileType.js - test the arb file type handler object.
 *
 * Copyright (c) 2023, JEDLSoft
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

if (!ArbFileType) {
    var ArbFileType = require("../ArbFileType.js");
    var CustomProject =  require("loctool/lib/CustomProject.js");
}

var p = new CustomProject({
    id: "test",
    plugins: ["../."],
    sourceLocale: "en-KR"
}, "./test/testfiles", {
    locales:["en-GB"]
});

module.exports.arbfiletype = {
    testArbFileTypeConstructor: function(test) {
        test.expect(1);
        var arbft = new ArbFileType(p);
        test.ok(arbft);
        test.done();
    },
    testArbFileTypeHandlesJsonTrue: function(test) {
        test.expect(2);
        var arbft = new ArbFileType(p);
        test.ok(arbft);
        test.ok(arbft.handles("intl_messages.arb"));
        test.done();
    },
    testArbFileTypeHandlesJsonPath: function(test) {
        test.expect(2);
        var arbft = new ArbFileType(p);
        test.ok(arbft);
        test.ok(arbft.handles("foo/bar/intl_messages.arb"));
        test.done();
    },
    testArbFileTypeHandlesArbFalse: function(test) {
        test.expect(2);
        var arbft = new ArbFileType(p);
        test.ok(arbft);
        test.ok(!arbft.handles("foo.ar"));
        test.done();
    },
    testArbFileTypeHandlesArbFalse2: function(test) {
        test.expect(2);
        var arbft = new ArbFileType(p);
        test.ok(arbft);
        test.ok(!arbft.handles("messages.json"));
        test.done();
    },
    testArbFileTypeHandlesArbFalse3: function(test) {
        test.expect(2);
        var arbft = new ArbFileType(p);
        test.ok(arbft);
        test.ok(!arbft.handles("intl.arb"));
        test.done();
    },
    testArbFileTypeHandlesArbFalse4: function(test) {
        test.expect(2);
        var arbft = new ArbFileType(p);
        test.ok(arbft);
        test.ok(!arbft.handles("foo/bar/intl_ko.arb"));
        test.done();
    }
};