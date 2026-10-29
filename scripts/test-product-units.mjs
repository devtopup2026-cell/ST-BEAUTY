import assert from 'node:assert/strict';
import {normalizeUnit,productUnits} from '../lib/product-units.ts';
for(const unit of productUnits)assert.equal(normalizeUnit(unit),unit);
assert.equal(normalizeUnit(' เรือน '),'เรือน');
assert.equal(normalizeUnit(undefined),'ชิ้น');
for(const invalid of [null,'',100,{},'ฟรี','<script>'])assert.equal(normalizeUnit(invalid),null);
console.log('PASS: supported units, whitespace, legacy default, invalid values');
