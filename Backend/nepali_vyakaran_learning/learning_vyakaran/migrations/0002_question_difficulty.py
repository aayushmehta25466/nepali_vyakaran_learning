from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("learning_vyakaran", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="question",
            name="difficulty",
            field=models.CharField(choices=[("easy", "Easy"), ("medium", "Medium"), ("hard", "Hard")], default="medium", max_length=10),
        ),
    ]
