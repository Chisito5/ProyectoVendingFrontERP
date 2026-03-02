@extends('layouts.app')

@section('title', 'Acceso denegado | Frontend ERP Vending')
@section('page_key', 'sin-acceso')

@section('content')
<section class="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow">
    <h1 class="text-2xl font-bold text-amber-900">Acceso denegado</h1>
    <p class="mt-2 text-sm text-amber-800">Tu rol no tiene permiso para acceder a esta pantalla. Solicita autorización al administrador.</p>
    <a href="{{ route('tablero') }}" class="mt-4 inline-block rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800">Volver al tablero</a>
</section>
@endsection

