import os
import requests
from collections import defaultdict

# Reemplaza 'your-username' con tu nombre de usuario de GitHub
username = 'Dekstro999'

# Obtiene el token de acceso personal de las variables de entorno
token = os.getenv('MY_GITHUB_TOKEN')

headers = {
    'Authorization': f'token {token}'
}

def get_repos(username):
    url = f'https://api.github.com/users/{username}/repos'
    response = requests.get(url, headers=headers)
    return response.json()

def get_languages(repo):
    url = repo['languages_url']
    response = requests.get(url, headers=headers)
    return response.json()

repos = get_repos(username)
language_stats = defaultdict(int)

for repo in repos:
    languages = get_languages(repo)
    for language, bytes_of_code in languages.items():
        language_stats[language] += bytes_of_code

total_bytes = sum(language_stats.values())

language_percentages = {language: (bytes_of_code / total_bytes) * 100 for language, bytes_of_code in language_stats.items()}

sorted_languages = sorted(language_percentages.items(), key=lambda x: x[1], reverse=True)

with open('languages_stats.md', 'w') as f:
    f.write('# Language Statistics\n')
    f.write('| Language | Percentage |\n')
    f.write('|----------|------------|\n')
    for language, percentage in sorted_languages:
        f.write(f'| {language} | {percentage:.2f}% |\n')

print("Language statistics have been written to 'languages_stats.md'")
