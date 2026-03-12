<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('push_subscriptions', 'subscribable_id')) {
            Schema::table('push_subscriptions', function (Blueprint $table) {
                $table->unsignedBigInteger('subscribable_id')->nullable()->after('id');
                $table->string('subscribable_type')->nullable()->after('subscribable_id');
                $table->string('content_encoding')->nullable()->after('auth_token');
            });
        }

        if (Schema::hasColumn('push_subscriptions', 'user_id')) {
            DB::table('push_subscriptions')->update([
                'subscribable_id' => DB::raw('user_id'),
                'subscribable_type' => \App\Models\User::class,
            ]);

            Schema::table('push_subscriptions', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
                $table->dropUnique(['user_id', 'endpoint']);
                $table->dropColumn('user_id');
            });
        }

        $hasEndpointUnique = collect(DB::select("SHOW INDEX FROM push_subscriptions WHERE Column_name = 'endpoint'"))
            ->contains(fn ($idx) => ($idx->Non_unique ?? 1) == 0);
        if (!$hasEndpointUnique) {
            Schema::table('push_subscriptions', function (Blueprint $table) {
                $table->unique('endpoint');
            });
        }
    }

    public function down(): void
    {
        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->dropUnique(['endpoint']);
            $table->unsignedBigInteger('user_id')->nullable()->after('id');
        });

        DB::table('push_subscriptions')->update([
            'user_id' => DB::raw('subscribable_id'),
        ]);

        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->dropColumn(['subscribable_id', 'subscribable_type', 'content_encoding']);
            $table->unique(['user_id', 'endpoint']);
        });
    }
};
