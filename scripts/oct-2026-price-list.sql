-- 16 Ekim 2026 satış fiyat listesi + %15 indirim
-- price = liste, discount_price = liste * 0.85, compare_price = liste
-- Signature Collection, Petek Bal, Arı Sütü ve sitede olmayan kalemler yok.

BEGIN;

-- Kestane ve Ihlamur
UPDATE product_variants SET price = 1100, discount_price = 935,  compare_price = 1100 WHERE id = 'cc550924-e5af-4941-a6eb-e8d2c7543553';
UPDATE product_variants SET price = 2200, discount_price = 1870, compare_price = 2200 WHERE id = '6d41429f-86a6-4568-b6c7-6f4d6bf34c41';
UPDATE products SET base_price = 935 WHERE id = 'dd66dad9-597a-4950-bba4-e30c7aaea7c8';

-- Çam
UPDATE product_variants SET price = 800,  discount_price = 680,  compare_price = 800  WHERE id = '171196eb-8ab0-4229-a2a5-32af12c825c0';
UPDATE product_variants SET price = 1600, discount_price = 1360, compare_price = 1600 WHERE id = '4d75b908-7c9a-4468-8e75-e5b7b9a20e8d';
UPDATE products SET base_price = 1360 WHERE id = '137acdea-d39c-4a51-976a-260b4536b78e';

-- Süzme Çiçek
UPDATE product_variants SET price = 800,  discount_price = 680,  compare_price = 800  WHERE id = '6aac4beb-ad1b-479e-8e6f-9834acaebb1f';
UPDATE product_variants SET price = 1600, discount_price = 1360, compare_price = 1600 WHERE id = '26dd9526-31da-425e-ada8-20cc72179cc0';
UPDATE products SET base_price = 1360 WHERE id = '3a273448-f325-479e-a7b5-6713469a38bf';

-- Dağ
UPDATE product_variants SET price = 1300, discount_price = 1105, compare_price = 1300 WHERE id = 'f51c209a-f455-4963-8dd4-610c2d6b0302';
UPDATE product_variants SET price = 2600, discount_price = 2210, compare_price = 2600 WHERE id = '766e6551-97e1-4d9e-be93-4ac029d90a95';
UPDATE products SET base_price = 1105 WHERE id = '1747c4d1-4e07-4245-82c3-98cb026eb572';

-- Kestane
UPDATE product_variants SET price = 2000, discount_price = 1700, compare_price = 2000 WHERE id = '04afc0d2-3840-41f9-af86-65512b156e83';
UPDATE product_variants SET price = 3900, discount_price = 3315, compare_price = 3900 WHERE id = '1be79887-99b8-4698-abfd-e43bbea81920';
UPDATE products SET base_price = 3315 WHERE id = '15d8c406-1a2d-4cd3-972c-4401a507a346';

-- Sedir
UPDATE product_variants SET price = 1100, discount_price = 935,  compare_price = 1100 WHERE id = 'bb5439b3-7f0a-44e1-a7d3-2a8a1073b195';
UPDATE product_variants SET price = 2200, discount_price = 1870, compare_price = 2200 WHERE id = '695368ba-341c-40d9-adaa-3640863bcc97';
UPDATE products SET base_price = 1870 WHERE id = '4a4e1dce-ca15-4af8-a79f-9afbdc6897a7';

-- Lavanta
UPDATE product_variants SET price = 1800, discount_price = 1530, compare_price = 1800 WHERE id = '854f7d3c-90a0-451f-9c92-195266064406';
UPDATE product_variants SET price = 3500, discount_price = 2975, compare_price = 3500 WHERE id = '1d3ff5ad-b0ae-4030-8fc2-76b589b5bdce';
UPDATE products SET base_price = 2975 WHERE id = 'c93345ba-92c6-449e-ab10-b3cd7d2a799c';

-- Kekik
UPDATE product_variants SET price = 1800, discount_price = 1530, compare_price = 1800 WHERE id = '83709702-6faa-416e-a34d-238719191123';
UPDATE product_variants SET price = 3500, discount_price = 2975, compare_price = 3500 WHERE id = '91501d1e-93fa-43ea-9494-17f9473409a1';
UPDATE products SET base_price = 2975 WHERE id = 'f2563fff-271b-44ce-a3ea-29281ab3a54b';

-- Beyaz Bal 500 gr (1000 gr sitede yok)
UPDATE product_variants SET price = 1800, discount_price = 1530, compare_price = 1800 WHERE id = '7956e5f4-b6ef-4e63-ac4c-00763be0ec44';
UPDATE products SET base_price = 1530 WHERE id = '8273b15b-fa74-49dc-bcd0-8ec2ab61378c';

-- Arı ürünleri
UPDATE product_variants SET price = 2400, discount_price = 2040, compare_price = 2400 WHERE id = 'fb3eecc3-02ff-45c7-a7c0-d58737433aa2';
UPDATE products SET base_price = 2040 WHERE id = '2970b837-eabf-4bd8-9170-47579511bb4d';

UPDATE product_variants SET price = 600,  discount_price = 510,  compare_price = 600  WHERE id = 'bf8018ec-c1b7-4350-ab60-88cf2b9f0c1b';
UPDATE products SET base_price = 510 WHERE id = 'e0450467-dfa9-4b29-bbc3-271dd6b33d8b';

UPDATE product_variants SET price = 800,  discount_price = 680,  compare_price = 800  WHERE id = '0a59d7fa-4bdc-411c-a0a0-d69a6d7caa1d';
UPDATE products SET base_price = 680 WHERE id = '38974108-f53e-4f0d-8a64-0b4f5a39ca29';

UPDATE product_variants SET price = 1000, discount_price = 850,  compare_price = 1000 WHERE id = 'ea0ead4a-d759-466c-8103-06c18f73b9de';
UPDATE products SET base_price = 850 WHERE id = '4411ea3e-3be1-4d03-9a2e-f7e33997d4d5';

UPDATE product_variants SET price = 500,  discount_price = 425,  compare_price = 500  WHERE id = 'b186033e-9aa9-446d-98cc-5b9cac5840ee';
UPDATE products SET base_price = 425 WHERE id = '287c3bce-bd5a-4301-b15a-b9daf6c02981';

-- Signature Series
UPDATE product_variants SET price = 3600, discount_price = 3060, compare_price = 3600 WHERE id = 'c4665bf2-3fdc-4c7d-8cc9-8c0b63729516';
UPDATE products SET base_price = 3060 WHERE id = 'be76e6e6-9059-4013-85b3-fc3fa8f1e3af';

UPDATE product_variants SET price = 3300, discount_price = 2805, compare_price = 3300 WHERE id = '56d90314-efbc-4a5d-9728-777b560fe3b3';
UPDATE products SET base_price = 2805 WHERE id = '3f5ccb99-4c72-411a-aca9-7f9955ef5274';

UPDATE product_variants SET price = 3200, discount_price = 2720, compare_price = 3200 WHERE id = '3c1fd13a-2405-4d08-9efc-c9b7cce87c00';
UPDATE products SET base_price = 2720 WHERE id = '3506cae1-21c7-47c3-b0ca-6f2aad9875c9';

UPDATE product_variants SET price = 2600, discount_price = 2210, compare_price = 2600 WHERE id = '492fbb35-aeea-4f7c-95d3-a11bb84369e3';
UPDATE products SET base_price = 2210 WHERE id = '9f1259bf-6255-4a8d-9561-36a223fafd46';

UPDATE product_variants SET price = 2300, discount_price = 1955, compare_price = 2300 WHERE id = '4b535ef5-7849-44d4-8691-c30b09586f7b';
UPDATE products SET base_price = 1955 WHERE id = '09866364-fd78-4819-8a39-b7b51b030986';

UPDATE product_variants SET price = 2200, discount_price = 1870, compare_price = 2200 WHERE id = 'ae0f9d01-959c-4c70-8103-f9fdf71415e0';
UPDATE products SET base_price = 1870 WHERE id = 'c56e38d3-5c42-4a80-b623-6b00ee0a4b85';

-- Goldylium parfüm
UPDATE product_variants SET price = 1700, discount_price = 1445, compare_price = 1700 WHERE id = 'ed2c6349-d956-403a-926c-d83dd8d7e026';
UPDATE products SET base_price = 1445 WHERE id = 'af4f1c94-da84-4fd1-9b1b-5b73eea57df8';

UPDATE product_variants SET price = 1700, discount_price = 1445, compare_price = 1700 WHERE id = '21133331-309a-4696-be49-71c9d491acb1';
UPDATE products SET base_price = 1445 WHERE id = 'ff5fee34-e27c-499e-ac42-b5ae903075e8';

UPDATE product_variants SET price = 1700, discount_price = 1445, compare_price = 1700 WHERE id = 'f87f3425-390e-4936-825d-9fe69f85023a';
UPDATE products SET base_price = 1445 WHERE id = '05695512-b3ff-4250-9764-926fc619b138';

UPDATE product_variants SET price = 1700, discount_price = 1445, compare_price = 1700 WHERE id = '1d9a9c93-49a7-4ed0-9b54-66400e13a0a8';
UPDATE products SET base_price = 1445 WHERE id = 'efeef208-3984-4aa6-b751-3678d0531444';

UPDATE product_variants SET price = 1700, discount_price = 1445, compare_price = 1700 WHERE id = 'c25dba6e-9251-409e-9a1f-b0410ef4d241';
UPDATE products SET base_price = 1445 WHERE id = 'fc08a5e4-9f4e-4cd0-bab2-eda1f6e73362';

UPDATE product_variants SET price = 1700, discount_price = 1445, compare_price = 1700 WHERE id = 'befeec38-3613-46b4-9b54-ade6ac0e6486';
UPDATE products SET base_price = 1445 WHERE id = 'd95ce091-c2e9-47c9-9be7-0761bc79d2d3';

UPDATE product_variants SET price = 1700, discount_price = 1445, compare_price = 1700 WHERE id = '8cffd8a9-643e-4f7a-a40e-d5c9bf2b2c41';
UPDATE products SET base_price = 1445 WHERE id = '1ddb0b57-33a8-4129-9b34-5d27bb44c622';

COMMIT;
