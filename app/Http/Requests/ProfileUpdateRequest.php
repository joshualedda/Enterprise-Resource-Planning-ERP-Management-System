<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:80'],
            'middle_name' => ['nullable', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            // user_information fields
            'phone_number' => ['nullable', 'string', 'max:32'],
            'region_id' => ['nullable', 'integer'],
            'province_id' => ['nullable', 'integer'],
            'municipality_id' => ['nullable', 'integer'],
            'barangay_id' => ['nullable', 'integer'],
            'zipcode' => ['nullable', 'string', 'max:12'],
        ];
    }
}
