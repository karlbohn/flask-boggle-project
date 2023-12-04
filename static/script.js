class Boggle {
    constructor(boardId, seconds = 60) {
        this.seconds = seconds;
        this.score = 0;
        this.words = new Set();
        this.board = $("#" + boardId);
        this.showTimer();
        this.timer = setInterval(this.timerTick.bind(this), 1000);
    }

    showWord(word) {
        $(".words", this.board).append($("<li>", { text: word }));
    }
    
    showScore() {
        $(".score", this.board).text(this.score);
    }

    // Function to pass messages to user
    alert(msg, cls) {
        $(".message", this.board)
      .text(msg)
      .removeClass()
      .addClass(`msg ${cls}`);
    }

    async handleSubmit(evt) {
        evt.preventDefault();
        const $word = $("#new-word", this.board);
        
        let word = $word.val();
        if (!word) return;

        if (this.words.has(word)) {
            this.alert(`${word} already found`)
        } 

        const resp = await axios.get("/verify-word", { params: { word: word }});
        if (resp.data.result === "not-word") {
          this.alert(`${word} is not a valid English word`, "err");
        } else if (resp.data.result === "not-on-board") {
          this.alert(`${word} is not a valid word on this board`, "err");
        } else {
          this.showWord(word);
          this.score += word.length;
          this.showScore();
          this.words.add(word);
          this.alert(`Added: ${word}`, "ok");
        }
    
        $word.val("").focus();
    }

    showTimer() {
        $(".timer", this.board).text(this.seconds)
    }

    async timerTick() { 
        this.seconds -= 1;
        this.showTimer();

        if (this.seconds == 0) {
            clearInterval(this.timer)
            await this.scoreGame()
        }
    }
    async scoreGame() {
        $(".new-word", this.board).hide();
        const resp = await axios.post("/score", { score: this.score });
        if (resp.data.brokeRecord) {
          this.alert(`New record: ${this.score}`, "ok");
        } else {
          this.alert(`Final score: ${this.score}`, "ok");
        }
      }
}