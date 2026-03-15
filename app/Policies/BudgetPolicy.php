<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Budget;

class BudgetPolicy
{
    public function view(User $user, Budget $budget): bool
    {
        return $user->id === $budget->user_id;
    }

    public function update(User $user, Budget $budget): bool
    {
        return $user->id === $budget->user_id;
    }

    public function delete(User $user, Budget $budget): bool
    {
        return $user->id === $budget->user_id;
    }
}
