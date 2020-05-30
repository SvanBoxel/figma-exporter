var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var https = require('https');
var fs = require('fs');
var Figma = require('figma-js');
var sanitize = require('sanitize-filename');
var validNodeTypes = ['PAGE', 'CANVAS', 'FRAME'];
var defaultOutputFolder = './figma-export';
var FigmaExporter = /** @class */ (function () {
    function FigmaExporter(token, key) {
        this.key = key;
        this.data = [];
        this.client = Figma.Client({
            personalAccessToken: token
        });
    }
    FigmaExporter.prototype.collectNodes = function (filter) {
        if (filter === void 0) { filter = { name: [], id: [] }; }
        return __awaiter(this, void 0, void 0, function () {
            var data, reduceFn, filteredNodes;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client.file(this.key)];
                    case 1:
                        data = (_b.sent()).data;
                        reduceFn = function (arr, cur) {
                            if (cur === void 0) { cur = filteredNodes; }
                            var search = filter.name.includes(cur.name) || filter.id.includes(cur.id);
                            if (search && validNodeTypes.includes(cur.type)) {
                                arr.push({
                                    id: cur.id,
                                    name: cur.name
                                });
                            }
                            if (cur.children && cur.children.length) {
                                arr.push.apply(arr, cur.children.reduce(reduceFn, []));
                            }
                            return arr;
                        };
                        filteredNodes = data.document.children.reduce(reduceFn, []) || [];
                        (_a = this.data).push.apply(_a, filteredNodes);
                        return [2 /*return*/, this.data];
                }
            });
        });
    };
    FigmaExporter.prototype.getNodeImageUrls = function (format) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.data.length) {
                            return [2 /*return*/, this.data];
                        }
                        return [4 /*yield*/, this.client.fileImages(this.key, {
                                ids: this.data.map(function (node) { return node.id; }),
                                format: format
                            })];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, (this.data = this.data.map(function (node) { return (__assign(__assign({}, node), { imageUrl: data.images[node.id], imageFormat: format })); }))];
                }
            });
        });
    };
    FigmaExporter.prototype.writeImages = function (dir) {
        if (dir === void 0) { dir = defaultOutputFolder; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(this.data.map(function (node) { return _this.writeSingleImage(node, dir); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.data];
                }
            });
        });
    };
    FigmaExporter.prototype.writeSingleImage = function (node, dir) {
        var _this = this;
        !fs.existsSync(dir) && fs.mkdirSync(dir);
        var fileName = sanitize(node.name) + "." + node.imageFormat;
        return new Promise(function (resolve, reject) {
            var file = fs.createWriteStream(dir + "/" + fileName);
            https.get(node.imageUrl, function (response) {
                response.pipe(file);
                _this.data.find(function (_a) {
                    var id = _a.id;
                    return id === node.id;
                }).fileName = fileName;
                file.on('finish', function () { return resolve(); });
                file.on('error', function (err) { return reject(err); });
            });
        });
    };
    return FigmaExporter;
}());
module.exports = FigmaExporter;