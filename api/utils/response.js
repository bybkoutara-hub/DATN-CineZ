"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fail = exports.created = exports.ok = void 0;
// Helper thống nhất format JSON response theo pattern { success, data/message }
const ok = (res, data, message = "Thành công") => res.status(200).json({ success: true, message, data });
exports.ok = ok;
const created = (res, data) => res.status(201).json({ success: true, data });
exports.created = created;
const fail = (res, message, code = 400) => res.status(code).json({ success: false, message });
exports.fail = fail;
//# sourceMappingURL=response.js.map