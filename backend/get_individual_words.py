import csv, os, sys
import subprocess
from moviepy.editor import VideoFileClip, AudioFileClip, concatenate_videoclips
import moviepy.video.fx.all as vfx

csv_file_path = './transcribed/transcribed_audio.aac.words.csv'

badWords = ["fuck", "bitch"]
bw_found = []
bw_start = []
bw_end = []

def contains_bad_word(word, badWords):
    for badWord in badWords:
        if badWord in word:
            return True
    return False 

with open(csv_file_path, 'r') as csvfile:
    csvreader = csv.reader(csvfile)

    for row in csvreader:
        if contains_bad_word(row[0].lower(), badWords):
            bw_found.append(row[0])
            bw_start.append(row[1])
            bw_end.append(row[2])
    bw_found.append("xyz")

def adjust_speed_to_duration(input_path, output_path, target_duration, name):
    #opens clip
    clip = VideoFileClip(input_path)

    #finds speed that the clip needs to be slowed down/sped up by
    speed_factor = clip.duration / target_duration
    
    #modifies clip
    modified_clip = clip.fx(vfx.speedx, speed_factor)

    #this is the path the video will write to
    output_file = os.path.join(output_path, f"{name}.mp4")

    #write video to specified path
    modified_clip.write_videofile(output_file)

    command = [
        'ffmpeg',
        '-i', output_file,             # Input file
        '-vn',                         # No video output
        '-acodec', 'libmp3lame',       # Use MP3 codec
        '-q:a', '2',                   # Quality setting for MP3 (where 0 is best, 9 is worst)
        os.path.join(output_path, f"{name}.mp3")  # Output file with .mp3 extension
    ]
    subprocess.run(command, check=True)


for position in range(len(bw_found)-1):
    adjust_speed_to_duration(' '.join(sys.argv[2:]), './edited_bleeps', float(bw_end[position])-float(bw_start[position]), position)

og_clip = VideoFileClip(sys.argv[1])
final_clips = []
iterator = 0
current_end = 0.0
current_start = 0.0

with open(csv_file_path, 'r') as csvfile:
    csvreader = csv.reader(csvfile)

    #adds from beginning to start of first word
    currentClip = og_clip.subclip(0.0, float(bw_start[0]))
    final_clips.append(currentClip)

    current_end = float(bw_start[0])

    for row in csvreader:
        #adds space between words if necessary
        current_start = float(row[1])
        if (current_start != current_end):
            currentClip = og_clip.subclip(current_end, current_start)
            final_clips.append(currentClip)

        #changes current_end to end of current clip
        current_end = float(row[2])
        currentClip = og_clip.subclip(float(row[1]), float(row[2]))


        if bw_found[iterator] != "xyz" and row[0] == bw_found[iterator]:
            bleep_audio = AudioFileClip(os.path.join('./edited_bleeps/', f"{str(iterator)}.mp3"))
            currentClip = currentClip.set_audio(bleep_audio)
            
            iterator += 1

        final_clips.append(currentClip)


    currentClip = og_clip.subclip(current_end)
    final_clips.append(currentClip)

    final_video = concatenate_videoclips(final_clips)

    final_video.write_videofile("output.mp4", codec="mpeg4")

    #other option for video writing (doesn't rly matter)
    #original_fps = og_clip.fps
    #final_video.write_videofile("output.MOV", codec="rawvideo", fps=original_fps, bitrate="8000k", preset="ultrafast", audio_bitrate="320k")
    
