import assert from 'node:assert/strict';
import {canAttachOrderSlip} from '../lib/order-slip-policy.ts';
const order={customerId:'customer-a',status:'Pending Payment',paymentSlip:null};
assert.equal(canAttachOrderSlip(order,'customer-a'),true);
assert.equal(canAttachOrderSlip(order,'customer-b'),false);
assert.equal(canAttachOrderSlip({...order,paymentSlip:'https://res.cloudinary.com/example/slip.png'},'customer-a'),false);
for(const status of ['Paid','Shipping','Completed','Rejected','unexpected'])assert.equal(canAttachOrderSlip({...order,status},'customer-a'),false);
console.log('PASS: owner may attach once while pending; other customers, existing evidence and closed states denied');
