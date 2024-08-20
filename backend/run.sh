if [ -z "$1" ]; then
    echo "Usage: $0 <video file>"
    exit 1
fi

VIDEO_FILE="$1"

source BleepinatorVEnv/bin/activate

rm -f final.mp4

ffmpeg -y -i "$VIDEO_FILE" -map 0:a:0 -acodec copy transcribed_audio.aac
#ffmpeg -y -i censor_bleep.mp4 -map 0:a:0 -acodec copy censor.aac
whisper_timestamped transcribed_audio.aac --model small.en --output_dir ./transcribed --output_format csv --accurate --vad True
#can use tiny.en, tiny, base.en, base, small.en, small, medium.en, medium, large-v1 (don't use)
#whisper_timestamped --help

python get_individual_words.py

#takes original video and output audio then merges them
ffmpeg -i "$VIDEO_FILE" -i output.mp4 -c:v copy -c:a copy -map 0:v:0 -map 1:a:0 final.mp4

rm -rf transcribed/*
rm -rf edited_bleeps/*
rm transcribed_audio.aac output.mp4