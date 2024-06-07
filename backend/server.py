from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess

app = Flask(__name__)
CORS(app)

@app.route('/process_video', methods=['POST'])
def process_video():
    video_file = request.files['censorFile']
    video_path = video_file.filename
    video_file.save(video_path)

    censorVid = request.files['bleepFile']
    censor_path = censorVid.filename
    censorVid.save(censor_path)

    try: 
        cmd = [
            'rm', '-f', 'final.mp4',
            '&&', 'ffmpeg', '-y', '-i', video_path, '-map', '0:a:0', '-acodec', 'copy', 'transcribed_audio.aac',
            '&&', 'whisper_timestamped', 'transcribed_audio.aac', '--model', 'small.en', '--output_dir', './transcribed', '--output_format', 'csv', '--accurate', '--vad', 'True',
            '&&', 'python', 'get_individual_words.py', video_path, censor_path,
            '&&', 'ffmpeg', '-i', video_path, '-i', 'output.mp4', '-c:v', 'copy', '-c:a', 'copy', '-map', '0:v:0', '-map', '1:a:0', 'final.mp4',
            '&&', 'rm', '-rf', 'transcribed/*',
            '&&', 'rm', '-rf', 'edited_bleeps/*',
            '&&', 'rm', '-f', 'transcribed_audio.aac', 'output.mp4', video_path, censor_path
        ]
        subprocess.run(' '.join(cmd), shell=True, check=True)
        return jsonify({'message': 'Video processed successfully'})
    except subprocess.CalledProcessError as e:
        return jsonify({'error': str(e)}, 500)

@app.route('/')
def hello():
    return "Hello World!"

if __name__ == '__main__':
    app.run(debug=True, port=5000)