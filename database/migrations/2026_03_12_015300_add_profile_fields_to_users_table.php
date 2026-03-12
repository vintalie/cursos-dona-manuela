<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('full_name')->nullable()->after('name');
            $table->string('avatar')->nullable()->after('full_name');
            $table->string('gender')->nullable()->after('avatar');
            $table->text('address')->nullable()->after('gender');
            $table->string('whatsapp')->nullable()->after('address');
            $table->string('phone')->nullable()->after('whatsapp');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['full_name', 'avatar', 'gender', 'address', 'whatsapp', 'phone']);
        });
    }
};
