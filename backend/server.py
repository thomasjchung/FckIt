from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess, json
import whisper_timestamped

app = Flask(__name__)
CORS(app)

@app.route('/process_video', methods=['POST'])
def process_video():
    print("Video received")
    video_file = request.files['censorFile']
    video_path = video_file.filename
    video_file.save(video_path)

    censorVid = request.files['bleepFile']
    censor_path = censorVid.filename
    censorVid.save(censor_path)

    censorWords = json.loads(request.form.get('words', '[]'))

    try:
        subprocess.run(['rm', '-f', '../bleepinator-app/public/final.mp4'], check=True)
        subprocess.run(['ffmpeg', '-y', '-i', video_path, '-map', '0:a:0', '-acodec', 'copy', 'transcribed_audio.aac'], check=True)
        print("converted audio")
        subprocess.run(['whisper_timestamped', 'transcribed_audio.aac', '--model', 'small.en', '--output_dir', './transcribed', '--output_format', 'csv', '--accurate', '--vad', 'True'], check=True)
        print("audio transcribed")
        subprocess.run(['python', 'get_individual_words.py', video_path, json.dumps(censorWords), censor_path], check=True)
        print("get_individual_words.py run")
        subprocess.run(['ffmpeg', '-i', video_path, '-i', 'output.mp4', '-c:v', 'copy', '-c:a', 'copy', '-map', '0:v:0', '-map', '1:a:0', '../bleepinator-app/public/final.mp4'], check=True)
        print("audio switched with original video")
        subprocess.run('rm -f ./transcribed/* ./edited_bleeps/* transcribed_audio.aac output.mp4 {}'.format(video_path, censor_path), shell=True, check=True)
        print("Everything else deleted")
        return jsonify({'videoUrl': "final.mp4"})
    except subprocess.CalledProcessError as e:
        return jsonify({'error': str(e)}, 500)

@app.route('/')
def hello():
    return "Hello World!"

if __name__ == '__main__':
    app.run(debug=True, port=5000)
