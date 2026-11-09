"""Email helpers for queue calls and appointment reminders.

Every helper is best-effort: a mail problem must never break a request or a
scheduled job, so failures are logged and swallowed. Messages are sent to both
account holders and public walk-ins, which is why the recipient address is
resolved from the ticket/patient instead of always using ``user.email``.
"""

import logging

from django.conf import settings
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.utils import formats, timezone, translation

logger = logging.getLogger(__name__)

DEFAULT_FROM_EMAIL = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@queuecare.local')
QUEUE_DISPLAY_URL = getattr(settings, 'QUEUE_DISPLAY_URL', '')

DEFAULT_LANGUAGE = 'English'

# Language names used across the app mapped to the locale codes Django ships.
LANGUAGE_CODES = {
    'English': 'en',
    'Kiswahili': 'sw',
    'Spanish': 'es',
    'French': 'fr',
    'German': 'de',
    'Portuguese': 'pt',
    'Italian': 'it',
}


def _log(message):
    """print()/logger helper that never raises on a non-UTF8 console."""
    try:
        logger.info(message)
    except Exception:  # pragma: no cover - logging must not break callers
        pass


def is_valid_email(email):
    """Return True when ``email`` looks like a usable address."""
    if not email:
        return False
    try:
        validate_email(email)
    except ValidationError:
        return False
    return True


def _send(subject, message, email):
    if not is_valid_email(email):
        return False
    try:
        send_mail(
            subject,
            message,
            DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=True,
        )
        _log(f"Email sent to {email}: {subject}")
        return True
    except Exception as exc:  # pragma: no cover - defensive
        _log(f"Email to {email} failed: {exc}")
        return False


def normalize_language(value):
    """Map a language name or BCP-47 tag onto a supported language name."""
    if not value:
        return DEFAULT_LANGUAGE
    raw = str(value).split(',')[0].split(';')[0].strip()
    if not raw:
        return DEFAULT_LANGUAGE
    for name in LANGUAGE_CODES:
        if name.lower() == raw.lower():
            return name
    code = raw.split('-')[0].lower()
    for name, lang_code in LANGUAGE_CODES.items():
        if lang_code == code:
            return name
    return DEFAULT_LANGUAGE


def request_language(request):
    """Language requested by an API call (``Accept-Language`` or ``?lang=``)."""
    if request is None:
        return DEFAULT_LANGUAGE
    try:
        query_value = request.query_params.get('lang')
    except Exception:  # pragma: no cover - not a DRF request
        query_value = None
    return normalize_language(
        query_value or request.META.get('HTTP_ACCEPT_LANGUAGE', '')
    )


def user_language(user):
    """Saved language preference for a user, falling back to the default."""
    if not user:
        return DEFAULT_LANGUAGE
    try:
        preference = getattr(user, 'preference', None)
        if preference is None:
            from .models import UserPreference

            preference = UserPreference.objects.filter(user=user).first()
        if preference and preference.language:
            return normalize_language(preference.language)
    except Exception:  # pragma: no cover - never break a mail send
        pass
    return DEFAULT_LANGUAGE


def format_datetime(value, language=None):
    """Localised date + time for emails, using Django's locale data."""
    if not hasattr(value, 'strftime'):
        return str(value)
    code = LANGUAGE_CODES.get(normalize_language(language), 'en')
    try:
        with translation.override(code):
            if timezone.is_aware(value):
                value = timezone.localtime(value)
            return formats.date_format(value, 'DATETIME_FORMAT')
    except Exception:  # pragma: no cover - defensive
        return value.strftime('%Y-%m-%d %H:%M')


def _text(kind, language):
    table = EMAIL_TEXT.get(kind, {})
    return table.get(normalize_language(language)) or table[DEFAULT_LANGUAGE]


def send_queue_called_email(email, patient_name, queue_number, room_number, language=None):
    """Tell a patient their queue number has been called."""
    if not email:
        return False

    language = normalize_language(language)
    template = _text('queue_called', language)
    message = template['body'].format(
        name=patient_name,
        number=queue_number,
        room=room_number or DEFAULT_ROOM[language],
    )
    if QUEUE_DISPLAY_URL:
        message += f"\n{QUEUE_DISPLAY_URL}"
    return _send(template['subject'].format(number=queue_number), message, email)


def send_queue_registered_email(
    email, patient_name, queue_number, department_name, language=None
):
    """Confirm a freshly issued queue ticket."""
    if not email:
        return False

    template = _text('queue_registered', language)
    message = template['body'].format(
        name=patient_name,
        number=queue_number,
        department=department_name,
    )
    return _send(template['subject'].format(number=queue_number), message, email)


def send_appointment_reminder_email(email, patient_name, doctor_name, date_time, language=None):
    """Remind a patient about an upcoming appointment."""
    if not email:
        return False

    template = _text('appointment_reminder', language)
    message = template['body'].format(
        name=patient_name,
        doctor=doctor_name,
        when=format_datetime(date_time, language),
    )
    return _send(template['subject'], message, email)


def send_appointment_confirmation_email(
    email, patient_name, doctor_name, date_time, language=None
):
    """Confirm an appointment booked at the public kiosk."""
    if not email:
        return False

    template = _text('appointment_confirmation', language)
    message = template['body'].format(
        name=patient_name,
        doctor=doctor_name,
        when=format_datetime(date_time, language),
    )
    return _send(template['subject'], message, email)


EMAIL_TEXT = {
    'queue_called': {
        'English': {
            'subject': 'Your Turn: Queue {number}',
            'body': (
                'Hello {name},\n\n'
                'It is your turn! Please proceed to {room}.\n\n'
                'Queue Number: {number}\n\nThank you,\nQueueCare'
            ),
        },
        'Kiswahili': {
            'subject': 'Zamu Yako: Namba {number}',
            'body': (
                'Habari {name},\n\n'
                'Ni zamu yako! Tafadhali nenda {room}.\n\n'
                'Namba ya Foleni: {number}\n\nAsante,\nQueueCare'
            ),
        },
        'Spanish': {
            'subject': 'Es su turno: número {number}',
            'body': (
                'Hola {name},\n\n'
                '¡Es su turno! Por favor diríjase a {room}.\n\n'
                'Número de turno: {number}\n\nGracias,\nQueueCare'
            ),
        },
        'French': {
            'subject': "C'est votre tour : numéro {number}",
            'body': (
                'Bonjour {name},\n\n'
                'C\'est votre tour ! Veuillez vous rendre à {room}.\n\n'
                'Numéro de file : {number}\n\nMerci,\nQueueCare'
            ),
        },
        'German': {
            'subject': 'Sie sind dran: Nummer {number}',
            'body': (
                'Hallo {name},\n\n'
                'Sie sind an der Reihe! Bitte begeben Sie sich zu {room}.\n\n'
                'Wartenummer: {number}\n\nVielen Dank,\nQueueCare'
            ),
        },
        'Portuguese': {
            'subject': 'É a sua vez: senha {number}',
            'body': (
                'Olá {name},\n\n'
                'É a sua vez! Dirija-se a {room}.\n\n'
                'Número da fila: {number}\n\nObrigado,\nQueueCare'
            ),
        },
        'Italian': {
            'subject': 'È il tuo turno: numero {number}',
            'body': (
                'Ciao {name},\n\n'
                'È il tuo turno! Ti preghiamo di recarti {room}.\n\n'
                'Numero di coda: {number}\n\nGrazie,\nQueueCare'
            ),
        },
    },
    'queue_registered': {
        'English': {
            'subject': 'Queue Ticket {number} Confirmed',
            'body': (
                'Hello {name},\n\n'
                'You are checked in at {department}.\n\n'
                'Queue Number: {number}\n'
                'We will email you again as soon as your number is called.\n\n'
                'Thank you,\nQueueCare'
            ),
        },
        'Kiswahili': {
            'subject': 'Tikiti ya Foleni {number} Imethibitishwa',
            'body': (
                'Habari {name},\n\n'
                'Umesajiliwa katika {department}.\n\n'
                'Namba ya Foleni: {number}\n'
                'Tutakutumia barua pepe tena namba yako itakapopigwa.\n\n'
                'Asante,\nQueueCare'
            ),
        },
        'Spanish': {
            'subject': 'Turno {number} confirmado',
            'body': (
                'Hola {name},\n\n'
                'Se ha registrado en {department}.\n\n'
                'Número de turno: {number}\n'
                'Le enviaremos otro correo en cuanto llamen a su número.\n\n'
                'Gracias,\nQueueCare'
            ),
        },
        'French': {
            'subject': 'Ticket de file {number} confirmé',
            'body': (
                'Bonjour {name},\n\n'
                'Vous êtes enregistré au service {department}.\n\n'
                'Numéro de file : {number}\n'
                'Nous vous enverrons un e-mail dès que votre numéro sera appelé.\n\n'
                'Merci,\nQueueCare'
            ),
        },
        'German': {
            'subject': 'Wartenummer {number} bestätigt',
            'body': (
                'Hallo {name},\n\n'
                'Sie sind in der Abteilung {department} eingecheckt.\n\n'
                'Wartenummer: {number}\n'
                'Wir schreiben Ihnen erneut, sobald Ihre Nummer aufgerufen wird.\n\n'
                'Vielen Dank,\nQueueCare'
            ),
        },
        'Portuguese': {
            'subject': 'Senha {number} confirmada',
            'body': (
                'Olá {name},\n\n'
                'Está registado em {department}.\n\n'
                'Número da fila: {number}\n'
                'Enviaremos outro e-mail assim que o seu número for chamado.\n\n'
                'Obrigado,\nQueueCare'
            ),
        },
        'Italian': {
            'subject': 'Ticket coda {number} confermato',
            'body': (
                'Ciao {name},\n\n'
                'Sei registrato presso {department}.\n\n'
                'Numero di coda: {number}\n'
                'Ti invieremo un\'altra email appena il tuo numero verrà chiamato.\n\n'
                'Grazie,\nQueueCare'
            ),
        },
    },
    'appointment_reminder': {
        'English': {
            'subject': 'Appointment Reminder',
            'body': (
                'Hello {name},\n\n'
                'This is a reminder for your appointment with {doctor} on {when}.\n\n'
                'See you soon!'
            ),
        },
        'Kiswahili': {
            'subject': 'Ukumbusho wa Miadi',
            'body': (
                'Habari {name},\n\n'
                'Huu ni ukumbusho wa miadi yako na {doctor} tarehe {when}.\n\n'
                'Tutaonana hivi karibuni!'
            ),
        },
        'Spanish': {
            'subject': 'Recordatorio de cita',
            'body': (
                'Hola {name},\n\n'
                'Este es un recordatorio de su cita con {doctor} el {when}.\n\n'
                '¡Hasta pronto!'
            ),
        },
        'French': {
            'subject': 'Rappel de rendez-vous',
            'body': (
                'Bonjour {name},\n\n'
                'Ceci est un rappel de votre rendez-vous avec {doctor} le {when}.\n\n'
                'À bientôt !'
            ),
        },
        'German': {
            'subject': 'Terminerinnerung',
            'body': (
                'Hallo {name},\n\n'
                'dies ist eine Erinnerung an Ihren Termin bei {doctor} am {when}.\n\n'
                'Bis bald!'
            ),
        },
        'Portuguese': {
            'subject': 'Lembrete de consulta',
            'body': (
                'Olá {name},\n\n'
                'Este é um lembrete da sua consulta com {doctor} em {when}.\n\n'
                'Até breve!'
            ),
        },
        'Italian': {
            'subject': 'Promemoria appuntamento',
            'body': (
                'Ciao {name},\n\n'
                'Questo è un promemoria del tuo appuntamento con {doctor} il {when}.\n\n'
                'A presto!'
            ),
        },
    },
    'appointment_confirmation': {
        'English': {
            'subject': 'Appointment Booked',
            'body': (
                'Hello {name},\n\n'
                'Your appointment with {doctor} is confirmed for {when}.\n\n'
                'Please arrive 10 minutes early. Reply to this email if you need to reschedule.'
            ),
        },
        'Kiswahili': {
            'subject': 'Miadi Imethibitishwa',
            'body': (
                'Habari {name},\n\n'
                'Miadi yako na {doctor} imethibitishwa kwa {when}.\n\n'
                'Tafadhali fika dakika 10 mapema. Jibu barua pepe hii ikiwa unahitaji kubadilisha muda.'
            ),
        },
        'Spanish': {
            'subject': 'Cita reservada',
            'body': (
                'Hola {name},\n\n'
                'Su cita con {doctor} está confirmada para {when}.\n\n'
                'Llegue 10 minutos antes. Responda a este correo si necesita reprogramar.'
            ),
        },
        'French': {
            'subject': 'Rendez-vous confirmé',
            'body': (
                'Bonjour {name},\n\n'
                'Votre rendez-vous avec {doctor} est confirmé pour le {when}.\n\n'
                'Merci d\'arriver 10 minutes en avance. Répondez à cet e-mail si vous devez le reporter.'
            ),
        },
        'German': {
            'subject': 'Termin gebucht',
            'body': (
                'Hallo {name},\n\n'
                'Ihr Termin bei {doctor} ist für {when} bestätigt.\n\n'
                'Bitte kommen Sie 10 Minuten früher. Antworten Sie auf diese E-Mail, wenn Sie umbuchen möchten.'
            ),
        },
        'Portuguese': {
            'subject': 'Consulta marcada',
            'body': (
                'Olá {name},\n\n'
                'A sua consulta com {doctor} está confirmada para {when}.\n\n'
                'Chegue 10 minutos antes. Responda a este e-mail se precisar de remarcar.'
            ),
        },
        'Italian': {
            'subject': 'Appuntamento prenotato',
            'body': (
                'Ciao {name},\n\n'
                'Il tuo appuntamento con {doctor} è confermato per {when}.\n\n'
                'Arriva 10 minuti prima. Rispondi a questa email se devi riprogrammare.'
            ),
        },
    },
}

DEFAULT_ROOM = {
    'English': 'the doctor',
    'Kiswahili': 'kwa daktari',
    'Spanish': 'la consulta del médico',
    'French': 'au cabinet du médecin',
    'German': 'zum Arzt',
    'Portuguese': 'ao médico',
    'Italian': 'dal medico',
}
