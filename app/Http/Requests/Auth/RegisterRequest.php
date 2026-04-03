<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email:rfc,dns',
                'regex:/^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|hotmail\.com|live\.com)$/i',
                'unique:users,email',
            ],
            'password' => 'required|string|min:8|confirmed',
            'g-recaptcha-response' => env('RECAPTCHA_SECRET_KEY') ? 'required' : 'nullable',
        ];
    }

    public function messages(): array
    {
        return [
            'email.regex' => 'Please use a Gmail or Microsoft email address.',
            'email.unique' => 'This email is already registered.',
            'password.confirmed' => 'The password confirmation does not match.',
            'password.min' => 'The password must be at least 8 characters.',
        ];
    }
}