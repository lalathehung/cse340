-- Part 1
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
-- Part 2
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';
-- Part 3
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';
-- Part 4 - Copy This to Rebuild File
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'the small interiors',
        'a huge interior'
    )
WHERE inv_make = 'GM'
    AND inv_model = 'Hummer';
-- PART 5
SELECT inv.inv_make,
    inv.inv_model,
    cls.classification_name
FROM public.inventory inv
    INNER JOIN public.classification cls ON inv.classification_id = cls.classification_id
WHERE cls.classification_name = 'Sport';
-- PART 6 - update thumbnail path - Copy This to Rebuild File
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');