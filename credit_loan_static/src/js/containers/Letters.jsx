import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, BindcardForm, Loading } from 'app/components';
import { WhiteSpace } from 'antd-mobile';


class Letters extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        let prop = { title: '来自未来的一封信', stage: 'letters' };

        return(
            <section >
                <Nav data={prop} />
                <WhiteSpace />
                <div>
                    <p>
                        未来的城市一片废墟，未来的少年无水可饮。在不久的将来，地球被异性占领，纯净水成了奢侈品，人类为一点水源就能兵刃相向。未来的孩子给祖辈们写信，怀念他们想象中不为一口水而争执的幸福场景。
                    </p>
                    <p>
                        来自为未来的一封信在控诉我们现在的人们不珍惜水源，导致到未来的子孙没有了水喝。希望今天的我们可以珍惜水源。
                    </p>
                </div>
            </section>
        )
    }
}

export default withRouter(Letters)
