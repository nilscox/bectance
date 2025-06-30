ALTER TABLE "shopping_lists" ADD COLUMN "sorted_item_ids" varchar(16)[];

UPDATE shopping_lists SET "sorted_item_ids" = '{}';

UPDATE shopping_lists sl
SET sorted_item_ids = sub.items
FROM (
  SELECT shopping_list_id list_id, array_agg(id) items
  FROM shopping_list_items
  GROUP BY shopping_list_id
) sub
WHERE sl.id = sub.list_id;

ALTER TABLE "shopping_lists" ALTER COLUMN "sorted_item_ids" SET NOT NULL;
