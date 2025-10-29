import json
import os
from typing import Dict, Any, List
import urllib.request
import urllib.parse

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Получает данные из Google Sheets и возвращает их в формате JSON
    Args: event - dict with httpMethod, queryStringParameters
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict with energy data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    sheet_url = os.environ.get('GOOGLE_SHEET_URL', '').strip()
    
    if not sheet_url or not sheet_url.startswith('http'):
        demo_entries = [
            {'date': '07.10.2025', 'score': 3, 'thoughts': 'вернулась с отпуска, очень хотела спать и очень много работы было', 'category': 'Нейтральный', 'week': '06.10.2025', 'month': '01.10.2025'},
            {'date': '08.10.2025', 'score': 5, 'thoughts': 'отпуск', 'category': 'Хороший', 'week': '06.10.2025', 'month': '01.10.2025'},
            {'date': '09.10.2025', 'score': 5, 'thoughts': 'отпуск', 'category': 'Хороший', 'week': '06.10.2025', 'month': '01.10.2025'},
            {'date': '15.10.2025', 'score': 3, 'thoughts': 'вернулась с отпуска', 'category': 'Нейтральный', 'week': '13.10.2025', 'month': '01.10.2025'},
            {'date': '16.10.2025', 'score': 3, 'thoughts': 'акклиматизация из отпуска в работу', 'category': 'Нейтральный', 'week': '13.10.2025', 'month': '01.10.2025'},
            {'date': '17.10.2025', 'score': 4, 'thoughts': 'постепенно в ритм вхожу', 'category': 'Хороший', 'week': '13.10.2025', 'month': '01.10.2025'},
            {'date': '18.10.2025', 'score': 5, 'thoughts': 'отличный спокойный выходной', 'category': 'Хороший', 'week': '13.10.2025', 'month': '01.10.2025'},
            {'date': '19.10.2025', 'score': 4, 'thoughts': 'была у Риммы, обсуждали работу, гуляли', 'category': 'Хороший', 'week': '13.10.2025', 'month': '01.10.2025'},
            {'date': '20.10.2025', 'score': 2, 'thoughts': 'сложный был понедельник', 'category': 'Плохой', 'week': '20.10.2025', 'month': '01.10.2025'},
            {'date': '21.10.2025', 'score': 4, 'thoughts': 'утром гулять не ходила', 'category': 'Хороший', 'week': '20.10.2025', 'month': '01.10.2025'},
            {'date': '22.10.2025', 'score': 5, 'thoughts': 'день был классный', 'category': 'Хороший', 'week': '20.10.2025', 'month': '01.10.2025'},
            {'date': '23.10.2025', 'score': 5, 'thoughts': 'хорошо поработала, прогулялась, запустили приложение в ГС', 'category': 'Хороший', 'week': '20.10.2025', 'month': '01.10.2025'},
        ]
        
        demo_stats = {
            'good': 8,
            'neutral': 3,
            'bad': 1,
            'average': 4.1,
            'total': 12
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'entries': demo_entries,
                'stats': demo_stats,
                'demo': True
            }, ensure_ascii=False)
        }
    
    try:
        if not sheet_url.startswith('https://docs.google.com/spreadsheets/'):
            raise ValueError('Invalid Google Sheets URL format')
            
        sheet_id = sheet_url.split('/d/')[1].split('/')[0]
        gid = '1030040391'
        csv_url = f'https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}'
        
        req = urllib.request.Request(csv_url)
        with urllib.request.urlopen(req, timeout=10) as response:
            csv_data = response.read().decode('utf-8')
        
        lines = csv_data.strip().split('\n')
        if len(lines) < 2:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'entries': [], 'stats': {}})
            }
        
        print(f'Total CSV lines: {len(lines)}')
        headers = [h.strip() for h in lines[0].split(',')]
        entries = []
        
        skipped = []
        for idx, line in enumerate(lines[1:], start=2):
            if not line.strip():
                skipped.append(f'Line {idx}: empty line')
                continue
            
            values = []
            current_value = ''
            in_quotes = False
            
            for char in line:
                if char == '"':
                    in_quotes = not in_quotes
                elif char == ',' and not in_quotes:
                    values.append(current_value.strip())
                    current_value = ''
                else:
                    current_value += char
            values.append(current_value.strip())
            
            try:
                date_str = values[0].strip() if len(values) > 0 else ''
                score_str = values[1].strip() if len(values) > 1 else ''
                
                if not date_str:
                    skipped.append(f'Line {idx}: empty date')
                    continue
                
                if not score_str:
                    skipped.append(f'Line {idx}: empty score for date {date_str}')
                    continue
                
                if not score_str.replace('.', '').replace(',', '').isdigit():
                    skipped.append(f'Line {idx}: invalid score "{score_str}" for date {date_str}')
                    continue
                
                score = int(score_str)
                if score < 1 or score > 5:
                    skipped.append(f'Line {idx}: score {score} out of range for date {date_str}')
                    continue
                
                thoughts = values[2].strip() if len(values) > 2 else ''
                category = values[4].strip() if len(values) > 4 else ''
                week = values[5].strip() if len(values) > 5 else ''
                month = values[6].strip() if len(values) > 6 else ''
                
                entry = {
                    'date': date_str,
                    'score': score,
                    'thoughts': thoughts,
                    'category': category,
                    'week': week,
                    'month': month
                }
                entries.append(entry)
            except (ValueError, IndexError) as e:
                skipped.append(f'Line {idx}: exception {e}')
                continue
        
        print(f'Parsed {len(entries)} entries from {len(lines)-1} lines')
        if skipped:
            for s in skipped[:10]:
                print(s)
            if len(skipped) > 10:
                print(f'... and {len(skipped)-10} more skipped lines')
        
        good_count = sum(1 for e in entries if e['score'] >= 4)
        neutral_count = sum(1 for e in entries if e['score'] == 3)
        bad_count = sum(1 for e in entries if e['score'] <= 2)
        avg_score = sum(e['score'] for e in entries) / len(entries) if entries else 0
        
        stats = {
            'good': good_count,
            'neutral': neutral_count,
            'bad': bad_count,
            'average': round(avg_score, 1),
            'total': len(entries)
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'entries': entries,
                'stats': stats
            }, ensure_ascii=False)
        }
        
    except Exception as e:
        demo_entries = [
            {'date': '07.10.2025', 'score': 3, 'thoughts': 'вернулась с отпуска, очень хотела спать и очень много работы было', 'category': 'Нейтральный', 'week': '06.10.2025', 'month': '01.10.2025'},
            {'date': '08.10.2025', 'score': 5, 'thoughts': 'отпуск', 'category': 'Хороший', 'week': '06.10.2025', 'month': '01.10.2025'},
            {'date': '09.10.2025', 'score': 5, 'thoughts': 'отпуск', 'category': 'Хороший', 'week': '06.10.2025', 'month': '01.10.2025'},
            {'date': '15.10.2025', 'score': 3, 'thoughts': 'вернулась с отпуска', 'category': 'Нейтральный', 'week': '13.10.2025', 'month': '01.10.2025'},
            {'date': '16.10.2025', 'score': 3, 'thoughts': 'акклиматизация из отпуска в работу', 'category': 'Нейтральный', 'week': '13.10.2025', 'month': '01.10.2025'},
            {'date': '17.10.2025', 'score': 4, 'thoughts': 'постепенно в ритм вхожу', 'category': 'Хороший', 'week': '13.10.2025', 'month': '01.10.2025'},
            {'date': '18.10.2025', 'score': 5, 'thoughts': 'отличный спокойный выходной', 'category': 'Хороший', 'week': '13.10.2025', 'month': '01.10.2025'},
            {'date': '19.10.2025', 'score': 4, 'thoughts': 'была у Риммы, обсуждали работу, гуляли', 'category': 'Хороший', 'week': '13.10.2025', 'month': '01.10.2025'},
            {'date': '20.10.2025', 'score': 2, 'thoughts': 'сложный был понедельник', 'category': 'Плохой', 'week': '20.10.2025', 'month': '01.10.2025'},
            {'date': '21.10.2025', 'score': 4, 'thoughts': 'утром гулять не ходила', 'category': 'Хороший', 'week': '20.10.2025', 'month': '01.10.2025'},
            {'date': '22.10.2025', 'score': 5, 'thoughts': 'день был классный', 'category': 'Хороший', 'week': '20.10.2025', 'month': '01.10.2025'},
            {'date': '23.10.2025', 'score': 5, 'thoughts': 'хорошо поработала, прогулялась, запустили приложение в ГС', 'category': 'Хороший', 'week': '20.10.2025', 'month': '01.10.2025'},
        ]
        
        demo_stats = {
            'good': 8,
            'neutral': 3,
            'bad': 1,
            'average': 4.1,
            'total': 12
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'entries': demo_entries,
                'stats': demo_stats,
                'demo': True,
                'error': str(e)
            }, ensure_ascii=False)
        }