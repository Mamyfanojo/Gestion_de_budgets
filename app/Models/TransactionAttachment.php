<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'file_path',
        'original_filename',
        'file_type',
        'file_size',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
