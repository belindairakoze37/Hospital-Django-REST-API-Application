from django.db import migrations

# Native-language names for the departments seeded by earlier migrations.
# Keyed by the canonical English ``dept_name``.
TRANSLATIONS = {
    'Cardiology and Heart Care': {
        'Kiswahili': 'Magonjwa ya Moyo na Huduma ya Moyo',
        'Spanish': 'Cardiología y Cuidado del Corazón',
        'French': 'Cardiologie et Soins du Cœur',
        'German': 'Kardiologie und Herzpflege',
        'Portuguese': 'Cardiologia e Cuidados Cardíacos',
        'Italian': 'Cardiologia e Assistenza Cardiaca',
    },
    'Dental': {
        'Kiswahili': 'Meno',
        'Spanish': 'Odontología',
        'French': 'Dentaire',
        'German': 'Zahnmedizin',
        'Portuguese': 'Odontologia',
        'Italian': 'Odontoiatria',
    },
    'Gynecology': {
        'Kiswahili': 'Uzazi na Magonjwa ya Wanawake',
        'Spanish': 'Ginecología',
        'French': 'Gynécologie',
        'German': 'Gynäkologie',
        'Portuguese': 'Ginecologia',
        'Italian': 'Ginecologia',
    },
    'Pediatrics': {
        'Kiswahili': 'Watoto',
        'Spanish': 'Pediatría',
        'French': 'Pédiatrie',
        'German': 'Pädiatrie',
        'Portuguese': 'Pediatria',
        'Italian': 'Pediatria',
    },
    'Neurology': {
        'Kiswahili': 'Mfumo wa Neva',
        'Spanish': 'Neurología',
        'French': 'Neurologie',
        'German': 'Neurologie',
        'Portuguese': 'Neurologia',
        'Italian': 'Neurologia',
    },
    'General Surgery': {
        'Kiswahili': 'Upasuaji wa Jumla',
        'Spanish': 'Cirugía General',
        'French': 'Chirurgie Générale',
        'German': 'Allgemeinchirurgie',
        'Portuguese': 'Cirurgia Geral',
        'Italian': 'Chirurgia Generale',
    },
}


def seed_translations(apps, schema_editor):
    Department = apps.get_model('hospital', 'Department')
    for department in Department.objects.all():
        values = TRANSLATIONS.get((department.dept_name or '').strip())
        # Never overwrite names an administrator already translated.
        if values and not department.name_translations:
            department.name_translations = values
            department.save(update_fields=['name_translations'])


def unseed_translations(apps, schema_editor):
    Department = apps.get_model('hospital', 'Department')
    for department in Department.objects.all():
        if (department.dept_name or '').strip() in TRANSLATIONS:
            department.name_translations = {}
            department.save(update_fields=['name_translations'])


class Migration(migrations.Migration):

    dependencies = [
        ('hospital', '0010_department_name_translations'),
    ]

    operations = [
        migrations.RunPython(seed_translations, unseed_translations),
    ]
