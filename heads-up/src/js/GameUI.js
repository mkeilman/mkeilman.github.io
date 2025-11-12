import { GameManager } from './GameManager';
import { PokerGame } from './PokerGame';

class ActionButton {
    static ActionImages = {
        deal : 'DealButton',
        fold : 'FoldButton',
        bet : 'BetButton',
        flop : 'FlopButton',
        turn : 'TurnButton',
        river : 'RiverButton',
        finish : 'RiverButton',
        show : 'ShowButton',
        next : 'DealButton',
    };

    static ActionStrings = {
		none: '',
		newGame: 'New Game',
		deal: 'Deal',
		flop: 'Flop',
		turn: 'Turn',
		river: 'River',
		finish: 'Finish',
		show: 'Show Hands',
		next: 'Next Hand',
		bet: 'Bet',
		call: 'Call',
		raise: 'Raise',
		allIn: 'All In',
		check: 'Check',
		fold: 'Fold',
	};


    constructor(action) {
        this.title = ActionButton.ActionStrings[action] || '';
        this.image =ActionButton.ActionImages[action] || null;
    }
}

class GameUI {

    constructor(mgr) {
        this.mgr = mgr;

    }

    buildActionButtons()  {
		
		const bArr = [];
		for (const action of this.mgr.getActions()) {
			

            const b = new ActionButton(action);
			
			
			aButton.drawBorder = true
			
			aButton.isEnabled = true
			
			let abTextColor = GAME_ACTION_TEXT_COLORS[action] ??  UIColor.black
			let abBgColor = GAME_ACTION_BG_COLORS[action] ?? UIColor.white
			let abBColor =  UIColor.white

			switch action {
			case .newGame:
				aButton.drawSep = true
				aButton.titleLabel?.font = UIFont(descriptor: f.fontDescriptor, size: 1.25*f.pointSize)
				aButton.addTarget(self, action: #selector(newGame), for: UIControl.Event.touchUpInside)
			case .deal:
				aButton.addTarget(self, action: #selector(shuffleUpAndDeal), for: UIControl.Event.touchUpInside)
			case .flop:
				aButton.addTarget(self, action: #selector(flop(_ :)), for: UIControl.Event.touchUpInside)
			case .turn:
				aButton.addTarget(self, action: #selector(turn(_ :)), for: UIControl.Event.touchUpInside)
			case .river:
				aButton.addTarget(self, action: #selector(river(_ :)), for: UIControl.Event.touchUpInside)
			case .finish:
				aButton.addTarget(self, action: #selector(completeDeal), for: UIControl.Event.touchUpInside)
			case .show:
				aButton.addTarget(self, action: #selector(showCards), for: UIControl.Event.touchUpInside)
			case .next:
				aButton.addTarget(self, action: #selector(nextHand), for: UIControl.Event.touchUpInside)
			case.check:
				aButton.titleLabel?.font = UIFont(descriptor: f.fontDescriptor, size: 1.25*f.pointSize)
				aButton.addTarget(self, action: #selector(check), for: UIControl.Event.touchUpInside)
			case .bet:
				aButton.addTarget(self, action: #selector(bet), for: UIControl.Event.touchUpInside)
			case .fold:
				aButton.titleLabel?.font = UIFont(descriptor: f.fontDescriptor, size: 1.25*f.pointSize)
				aButton.drawSep = true
				aButton.addTarget(self, action: #selector(fold), for: UIControl.Event.touchUpInside)
			default:
				break
			}
			aButton.addTarget(self, action: #selector(clickOnTap), for: UIControl.Event.touchDown)
			aButton.textColor = abTextColor
			aButton.bgColor = abBgColor
			aButton.borderColor = abBColor
			
			aButton.layer.shadowOpacity = 1.0
			aButton.layer.shadowColor = UIColor.black.cgColor
			aButton.layer.shadowOffset = CGSize(width: 0.0, height: 1.0)
			aButton.layer.shadowRadius = 2.0

			bArr.append(aButton)
		}
		return bArr
	}
}

export {GameUI};