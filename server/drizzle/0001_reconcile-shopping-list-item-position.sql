CREATE PROCEDURE reconcile_shopping_list_item_position(shopping_list_id varchar(8))
LANGUAGE SQL
AS $$
  UPDATE shopping_list_items sli
  SET position = -row_number
  FROM (
    SELECT id, row_number()
    OVER (ORDER BY position)
    FROM shopping_list_items
    WHERE shopping_list_id = (shopping_list_id)
    ORDER BY position
  ) s
  WHERE sli.id = s.id;

  UPDATE shopping_list_items
  SET position = -position - 1
  WHERE shopping_list_id = (shopping_list_id);
$$;
