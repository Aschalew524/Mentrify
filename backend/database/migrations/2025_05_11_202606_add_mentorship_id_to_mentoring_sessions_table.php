<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('mentoring_sessions', function (Blueprint $table) {
            $table->foreignId('mentorship_id')->constrained('mentorships')->after('id'); // Or choose a more suitable position
            $table->foreignId('created_by_id')->constrained('users')->after('join_url'); // Example position
            $table->foreignId('cancelled_by_id')->nullable()->constrained('users')->after('created_by_id');
            $table->text('cancellation_reason')->nullable()->after('cancelled_by_id');
            $table->text('notes_mentee')->nullable()->after('cancellation_reason');
            $table->text('notes_mentor')->nullable()->after('notes_mentee');
            $table->integer('duration_minutes')->nullable()->after('notes_mentor');
            $table->string('session_type')->nullable()->after('duration_minutes'); // e.g., 'online', 'in-person'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mentoring_sessions', function (Blueprint $table) {
            $table->dropForeign(['mentorship_id']);
            $table->dropColumn('mentorship_id');
            $table->dropForeign(['created_by_id']);
            $table->dropColumn('created_by_id');
            $table->dropForeign(['cancelled_by_id']);
            $table->dropColumn('cancelled_by_id');
            $table->dropColumn('cancellation_reason');
            $table->dropColumn('notes_mentee');
            $table->dropColumn('notes_mentor');
            $table->dropColumn('duration_minutes');
            $table->dropColumn('session_type');
        });
    }
};
