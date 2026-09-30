<?php

namespace App\Database;

use Illuminate\Database\PostgresConnection as BasePostgresConnection;

/**
 * Postgres connection that works with emulated prepared statements.
 *
 * Supabase is far from the API server, so every network round trip counts. With real
 * (server-side) prepares, pdo_pgsql spends three round trips per query: prepare, execute,
 * deallocate. Emulated prepares (PDO::ATTR_EMULATE_PREPARES in config/database.php) send
 * one query with the values safely escaped by PDO — about 3x faster per query here.
 *
 * Laravel turns booleans into 1/0 before binding. As a server-side parameter Postgres
 * casts that to boolean, but inlined by emulation it becomes `is_published = 1`, which
 * fails ("operator does not exist: boolean = integer"). Binding 'true' / 'false' strings
 * works in both modes.
 */
class PostgresConnection extends BasePostgresConnection
{
    public function prepareBindings(array $bindings)
    {
        foreach ($bindings as $key => $value) {
            if (is_bool($value)) {
                $bindings[$key] = $value ? 'true' : 'false';
            }
        }

        return parent::prepareBindings($bindings);
    }
}
