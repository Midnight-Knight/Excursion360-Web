import { FieldItemAudioContent } from "../ExcursionModels/FieldItemAudioContent";
import { FieldItemContent } from "./FieldItemContent";
import { ExcursionConstants } from "../ExcursionConstants";
import { Material, Mesh, Sound, TransformNode, AssetsManager, Scene, StandardMaterial, Color3, MeshBuilder, Engine } from "@babylonjs/core/index";
import { TextBlock, GUI3DManager, AdvancedDynamicTexture, TextWrapping } from "@babylonjs/gui/index";
import { CustomHolographicButton } from "../../Stuff/CustomHolographicButton";


export class AudioContent implements FieldItemContent {
    static readonly CONTENT_TYPE: string = "audio";

    get type(): string {
        return AudioContent.CONTENT_TYPE;
    }


    private playPauseButton: CustomHolographicButton;
    private playPauseButtonText: TextBlock;
    private currentPositionText: TextBlock;
    private currentPositionTimer: any;

    private static backgroundMaterial: Material;
    private backgroundPlane: Mesh;
    private audio: Sound;
    private uiLayerPlane: Mesh;

    constructor(
        private audioInfo: FieldItemAudioContent,
        private parent: TransformNode,
        private contentWidth: number,
        private contentHeight: number,
        private onPlay: () => void,
        private gui3Dmanager: GUI3DManager,
        private assetsManager: AssetsManager,
        private scene: Scene) {
        if (!AudioContent.backgroundMaterial) {
            const material = new StandardMaterial('audio content background material', scene);
            material.diffuseColor = Color3.FromHexString("#727F8C");
            material.alpha = 0.8;
            AudioContent.backgroundMaterial = material;
        }

        this.createAudioContentPlane();
        this.createSound();
        this.createPlayPauseButton();
    }

    setIsVisible(visible: boolean) {
        this.backgroundPlane.isVisible = visible;
        this.playPauseButton.isVisible = visible;
        this.uiLayerPlane.isVisible = visible;
        if (!visible && this.audio) {
            this.audio && this.audio.pause();
            this.playPauseButtonText.text = ExcursionConstants.PlayIcon;
        }
    }

    createAudioContentPlane() {
        var backgroundPlane = MeshBuilder.CreatePlane("audio-content-plane", {
            width: 2,
            height: 2
        });
        backgroundPlane.parent = this.parent;
        backgroundPlane.position.z = - 0.2;
        backgroundPlane.position.y = this.contentHeight / 1.09;
        backgroundPlane.position.x = -this.contentWidth / 2.5;
        backgroundPlane.material = AudioContent.backgroundMaterial;
        const uiLayerPlane = backgroundPlane.clone();
        uiLayerPlane.position.z = backgroundPlane.position.z + 0.01;

        const texture = AdvancedDynamicTexture.CreateForMesh(backgroundPlane);

        const headerBlock = new TextBlock();
        headerBlock.text = "Аудио";
        headerBlock.color = "white";
        headerBlock.fontSize = "200";
        headerBlock.top = -400;


        const currentPositionBlock = new TextBlock();
        currentPositionBlock.text = this.getCurrentPositionText();
        currentPositionBlock.color = "white";
        currentPositionBlock.fontSize = "200";
        currentPositionBlock.top = 400;


        texture.addControl(headerBlock);
        texture.addControl(currentPositionBlock);
        this.currentPositionText = currentPositionBlock;

        this.backgroundPlane = backgroundPlane;
        this.uiLayerPlane = uiLayerPlane;
    }

    private createPlayPauseButton() {
        var button = new CustomHolographicButton(`video-content-play-pause-button`, 1, 1);
        this.gui3Dmanager.addControl(button);
        button.linkToTransformNode(this.backgroundPlane);
        var buttonContent = new TextBlock();
        buttonContent.text = "...";
        buttonContent.textWrapping = TextWrapping.WordWrap;
        buttonContent.resizeToFit = true;
        buttonContent.color = "white";
        buttonContent.fontSize = 250;
        this.playPauseButtonText = buttonContent;
        button.content = buttonContent;

        button.isVisible = true;
        // button.position.y = -0.1;
        button.onPointerClickObservable.add(() => {
            this.toggleAudioPlay();
        })
        this.playPauseButton = button;
        this.playPauseButtonText = buttonContent;
    }

    public playAudio() {
        if (!this.audio) {
            return;
        }
        this.onPlay();
        this.audio.play();
        this.playPauseButtonText.text = ExcursionConstants.PauseIcon;
    }

    public pauseAudio() {
        if (!this.audio) {
            return;
        }
        this.audio.pause();
        this.playPauseButtonText.text = ExcursionConstants.PlayIcon;
    }

    private toggleAudioPlay() {
        if (!this.audio) {
            return;
        }
        if (this.audio.isPlaying) {
            this.pauseAudio();
        } else {
            this.playAudio();
        }
    }

    private createSound() {
        const audio = new Sound("audio_content", this.audioInfo.src, this.scene, () => {
            this.audio = audio;
            this.playPauseButtonText.text = ExcursionConstants.PlayIcon;
            this.currentPositionTimer = setInterval(() => this.currentPositionText.text = this.getCurrentPositionText(), 500);
        }, {
            loop: false,
            autoplay: false
        });
    }

    private getCurrentPositionText(): string {
        return `${this.durationView(this.getCurrentPosition())}/${this.durationView(this.audioInfo.duration)}`;
    }

    private durationView(time: number) {
        const targetTime = Math.round(time);
        let view = `${targetTime % 60}`;
        let minutes = Math.floor(targetTime / 60);
        view = `${minutes % 60}:${view}`;
        if (!minutes) {
            return view;
        }
        let hours = Math.floor(minutes / 60);
        if (!hours) {
            return view;
        }
        view = `${hours}:${view}`;
    }

    private getCurrentPosition(): number {

        if (!this.audio) {
            return 0;
        }

        let currentTime: number = this.audio['_offset'] || 0;

        if (this.audio.isPlaying && Engine.audioEngine?.audioContext) {
            currentTime += Engine.audioEngine.audioContext.currentTime - this.audio['_startTime'];
        }
        return currentTime;
    }



    dispose() {
        this.playPauseButton.dispose();
        this.uiLayerPlane.dispose();
        this.backgroundPlane.dispose();
        this.audio && this.audio.dispose();
        this.currentPositionTimer && clearInterval(this.currentPositionTimer);
    }
}