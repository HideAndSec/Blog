<?php
// Dump a BookStack instance to JSON for scripts/import-bookstack.mjs.
// Run on the BookStack server: php export-bookstack.php > dump.json
//
// Every entity carries a `public` flag (viewable by the guest role, id 4) so
// the importer can keep restricted content out of the published site.
$env = [];
foreach (file('/var/www/bookstack/.env') as $line) {
    if (preg_match('/^([A-Z_]+)=(.*)$/', trim($line), $m)) {
        $env[$m[1]] = trim($m[2], "\"'");
    }
}
$db = new PDO(
    "mysql:host={$env['DB_HOST']};dbname={$env['DB_DATABASE']};charset=utf8mb4",
    $env['DB_USERNAME'], $env['DB_PASSWORD'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
);
$all = function ($sql) use ($db) { return $db->query($sql)->fetchAll(); };

$guestView = function ($type) {
    return "exists (select 1 from joint_permissions j where j.entity_id = e.id
        and j.entity_type = 'BookStack\\\\$type' and j.role_id = 4
        and j.action = 'view' and j.has_permission = 1) public";
};
$views = function ($type) {
    return "(select coalesce(sum(v.views), 0) from views v
        where v.viewable_type = 'BookStack\\\\$type' and v.viewable_id = e.id) views";
};
$common = 'e.id, e.name, e.slug, e.created_at, e.updated_at, e.created_by, e.updated_by, e.owned_by, e.restricted';

echo json_encode([
    'users' => $all("select u.id, u.name, u.slug, u.created_at, i.url avatar
        from users u left join images i on i.id = u.image_id where u.system_name is null"),
    'shelves' => $all("select $common, e.description, i.url cover, {$guestView('Bookshelf')}, {$views('Bookshelf')},
        (select group_concat(book_id order by `order`) from bookshelves_books where bookshelf_id = e.id) book_ids
        from bookshelves e left join images i on i.id = e.image_id where e.deleted_at is null"),
    'books' => $all("select $common, e.description, i.url cover, {$guestView('Book')}, {$views('Book')}
        from books e left join images i on i.id = e.image_id where e.deleted_at is null"),
    'chapters' => $all("select $common, e.book_id, e.description, e.priority, {$guestView('Chapter')}, {$views('Chapter')}
        from chapters e where e.deleted_at is null"),
    'pages' => $all("select $common, e.book_id, e.chapter_id, e.priority, e.revision_count, e.html, e.markdown,
        {$guestView('Page')}, {$views('Page')}
        from pages e where e.deleted_at is null and e.draft = 0"),
    'tags' => $all("select entity_type, entity_id, name, value from tags order by `order`"),
    'activities' => $all("select type, detail, user_id, entity_type, entity_id, created_at from activities order by created_at desc, id desc"),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
