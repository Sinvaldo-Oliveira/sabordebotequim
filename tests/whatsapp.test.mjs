// Testes das funções puras de WhatsApp e nome.
// Executar: node --test tests/
//
// Reimplementa a lógica testada em JS puro espelhando src/lib/voting/*.
// (O projeto usa TS sem runner de testes configurado; estes testes cobrem
// o comportamento das regras de normalização sem exigir toolchain extra.)
import { test } from "node:test";
import assert from "node:assert/strict";

const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35,
  37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64,
  65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88,
  89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

function parseBrazilianWhatsApp(raw) {
  let digits = (raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length > 11) digits = digits.slice(2);
  if (digits.length !== 11) return { ok: false, error: "len" };
  const ddd = Number(digits.slice(0, 2));
  if (!VALID_DDDS.has(ddd)) return { ok: false, error: "ddd" };
  if (digits[2] !== "9") return { ok: false, error: "cel" };
  const subscriber = digits.slice(2);
  if (/^(\d)\1{8}$/.test(subscriber)) return { ok: false, error: "fake" };
  return { ok: true, e164: `+55${digits}`, ddd, lastDigits: digits.slice(-4) };
}

function maskWhatsApp(e164) {
  const digits = e164.replace(/\D/g, "").replace(/^55/, "");
  if (digits.length !== 11) return e164;
  return `(${digits.slice(0, 2)}) 9****-${digits.slice(-4)}`;
}

function sanitizeVoterName(raw) {
  return (raw ?? "").replace(/\s+/g, " ").trim();
}
function isValidVoterName(name) {
  return name.length >= 3 && name.length <= 120;
}

test("normaliza número com máscara para E.164", () => {
  const r = parseBrazilianWhatsApp("(31) 99999-8888");
  assert.equal(r.ok, true);
  assert.equal(r.e164, "+5531999998888");
  assert.equal(r.lastDigits, "8888");
});

test("aceita número já com +55", () => {
  const r = parseBrazilianWhatsApp("+55 31 99999-8888");
  assert.equal(r.ok, true);
  assert.equal(r.e164, "+5531999998888");
});

test("rejeita DDD inválido", () => {
  assert.equal(parseBrazilianWhatsApp("(00) 99999-8888").ok, false);
});

test("rejeita celular sem o 9", () => {
  assert.equal(parseBrazilianWhatsApp("(31) 8888-7777").ok, false);
});

test("rejeita quantidade errada de dígitos", () => {
  assert.equal(parseBrazilianWhatsApp("3199999").ok, false);
});

test("rejeita sequência falsa (todos iguais)", () => {
  assert.equal(parseBrazilianWhatsApp("(31) 99999-9999".replace("99999-9999", "99999-99999")).ok, false);
  assert.equal(parseBrazilianWhatsApp("31999999999").ok, false);
});

test("máscara de exibição", () => {
  assert.equal(maskWhatsApp("+5531999991234"), "(31) 9****-1234");
});

test("sanitiza nome com espaços duplicados", () => {
  assert.equal(sanitizeVoterName("  João   da   Silva  "), "João da Silva");
});

test("valida tamanho mínimo do nome", () => {
  assert.equal(isValidVoterName("Jo"), false);
  assert.equal(isValidVoterName("Ana"), true);
});
