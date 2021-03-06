/* Calendar.js

{{IS_NOTE
	Purpose:

	Description:

	History:
		Fri Jan 23 10:32:34 TST 2009, Created by Flyworld
}}IS_NOTE

Copyright (C) 2008 Potix Corporation. All Rights Reserved.

{{IS_RIGHT
}}IS_RIGHT
*/
/** The date related widgets, such as datebox and calendar.
 */
//zk.$package('zul.db');

(function () {
	// Bug 2936994, fixed unnecessary setting scrollTop
	var _doFocus = zk.gecko ? function (n, timeout) {
			if (timeout)
				setTimeout(function () {
					zk(n).focus();
				});
			else
				zk(n).focus();
		} : function (n) {
			zk(n).focus();
		};

	function _newDate(year, month, day, bFix) {
		var v = new Date(year, month, day);
		return bFix && v.getMonth() != month && v.getDate() != day ? //Bug ZK-1213: also need to check date
			new Date(year, month + 1, 0)/*last day of month*/: v;
	}

/** @class zul.db.Renderer
 * The renderer used to render a calendar.
 * It is designed to be overridden
 */
zul.db.Renderer = {
	/** Returns the HTML fragment representing a day cell.
	 * By overriding this method, you could customize the look of a day cell.
	 * <p>Default: day
	 * @param zul.db.Calendar cal the calendar
	 * @param int y the year
	 * @param int m the month (between 0 to 11)
	 * @param int day the day (between 1 to 31)
	 * @param int monthofs the month offset. If the day is in the same month
	 * @return String the HTML fragment
	 * @since 5.0.3
	 */
	cellHTML: function (cal, y, m, day, monthofs) {
		return day;
	},
	/** Called before {@link zul.db.Calendar#redraw} is invoked.
	 * <p>Default: does nothing
	 * @param zul.db.Calendar cal the calendar
	 * @since 5.0.3
	 */
	beforeRedraw: function (cal) {
	},
	/** Tests if the specified date is disabled.
	 * <p>Default: it depends on the constraint, if any
	 * @param zul.db.Calendar cal the calendar
	 * @param int y the year
	 * @param int m the month (between 0 to 11)
	 * @param int v the day (between 1 to 31)
	 * @param Date today today
	 * @since 5.0.3
	 * @return boolean
	 */
	disabled: function (cal, y, m, v, today) {
		var d = new Date(y, m, v, 0, 0, 0, 0),
			constraint;
		
		if ((constraint = cal._constraint)&& typeof constraint == 'string') {
			
			// Bug ID: 3106676
			if ((constraint.indexOf("no past") > -1 && (d - today) / 86400000 < 0) ||
			    (constraint.indexOf("no future") > -1 && (today - d) / 86400000 < 0) ||
			    (constraint.indexOf("no today") > -1 && today - d == 0))
					return true;
		}
		
		var result = false;
		if (cal._beg && (result = (d - cal._beg) / 86400000 < 0))
			return result;
		if (cal._end && (result = (cal._end - d) / 86400000 < 0))
			return result;
		return result;
	},
	/**
	 * Generates the label of the week of year.
	 * <p>Default: the string of the value
	 * @param zul.db.Calendar wgt the calendar widget
	 * @param int the number of the week of the value
	 * @param Map localizedSymbols the symbols for localization 
	 * @return String the label of the week of year
	 * @since 6.5.0
	 */
	labelOfWeekOfYear: function (wgt, val) {
		return val + '';
	},
	/**
	 * Generates the title of the week of year.
	 * <p>Default: 'Wk'
	 * @param zul.db.Calendar wgt the calendar widget 
	 * @return String the title of the week of year
	 * @since 6.5.0
	 */
	titleOfWeekOfYear: function (wgt) {
		return 'Wk';
	},
	/**
	 * Renderer the dayView for this calendar
	 * @param zul.db.Calendar wgt the calendar widget
	 * @param Array out an array to output HTML fragments.
	 * @param Map localizedSymbols the symbols for localization 
	 * @since 6.5.0
	 */
	dayView: function (wgt, out, localizedSymbols) {
		var uuid = wgt.uuid,
			zcls = wgt.getZclass();
		out.push('<tr><td colspan="3"><table id="', uuid, '-mid" class="', zcls, '-calday" width="100%" border="0" cellspacing="0" cellpadding="0">',
				'<tr class="', zcls, '-caldow">');
		var sun = (7 - localizedSymbols.DOW_1ST) % 7, sat = (6 + sun) % 7;
		for (var j = 0 ; j < 7; ++j)
			out.push('<td class="', zcls, (j == sun || j == sat) ? '-wkend' : '-wkday', 
					'">' + localizedSymbols.S2DOW[j] + '</td>');
		out.push('</tr>');
		for (var j = 0; j < 6; ++j) { //at most 7 rows
			out.push('<tr class="', zcls, '-caldayrow" id="', uuid, '-w', j, '" >');
			for (var k = 0; k < 7; ++k)
				out.push ('<td class="', zcls, (k == sun || k == sat) ? '-wkend' : '-wkday', '"></td>');
			out.push('</tr>');
		}
	},
	/**
	 * Renderer the monthView for this calendar
	 * @param zul.db.Calendar wgt the calendar widget
	 * @param Array out an array to output HTML fragments.
	 * @param Map localizedSymbols the symbols for localization 
	 * @since 6.5.0
	 */
	monthView: function (wgt, out, localizedSymbols) {
		var uuid = wgt.uuid,
			zcls = wgt.getZclass();
		out.push('<tr><td colspan="3" ><table id="', uuid, '-mid" class="', zcls, '-calmon" width="100%" border="0" cellspacing="0" cellpadding="0">');
		for (var j = 0 ; j < 12; ++j) {
			if (!(j % 4)) out.push('<tr>');
			out.push('<td id="', uuid, '-m', j, '"_dt="', j ,'">', localizedSymbols.SMON[j] + '</td>');
			if (!((j + 1) % 4)) out.push('</tr>');
		}
	},
	/**
	 * Renderer the yearView for this calendar
	 * @param zul.db.Calendar wgt the calendar widget
	 * @param Array out an array to output HTML fragments.
	 * @param Map localizedSymbols the symbols for localization 
	 * @since 6.5.0
	 */
	yearView: function (wgt, out, localizedSymbols) {
		var uuid = wgt.uuid,
			zcls = wgt.getZclass(),
			val = wgt.getTime(),
			m = val.getMonth(),
			d = val.getDate(),
			y = val.getFullYear(),
			ydelta = new zk.fmt.Calendar(val, localizedSymbols).getYear() - y, 
			yofs = y - (y % 10 + 1);
		out.push('<tr><td colspan="3" ><table id="', uuid, '-mid" class="', zcls, '-calyear" width="100%" border="0" cellspacing="0" cellpadding="0">');

		for (var j = 0 ; j < 12; ++j) {
			if (!(j % 4)) out.push('<tr>');
			out.push('<td _dt="', yofs ,'" id="', uuid, '-y', j, '" >', yofs + ydelta, '</td>');
			if (!((j + 1) % 4)) out.push('</tr>');
			yofs++;
		}
	},
	/**
	 * Renderer the decadeView for this calendar
	 * @param zul.db.Calendar wgt the calendar widget
	 * @param Array out an array to output HTML fragments.
	 * @param Map localizedSymbols the symbols for localization 
	 * @since 6.5.0
	 */
	decadeView: function (wgt, out, localizedSymbols) {
		var uuid = wgt.uuid,
			zcls = wgt.getZclass(),
			val = wgt.getTime(),
			m = val.getMonth(),
			d = val.getDate(),
			y = val.getFullYear(),
			ydelta = new zk.fmt.Calendar(val, localizedSymbols).getYear() - y,
			ydec = zk.parseInt(y/100);
		
		out.push('<tr><td colspan="3" ><table id="', uuid, '-mid" class="', zcls, '-calyear" width="100%" border="0" cellspacing="0" cellpadding="0">');
		var temp = ydec*100 - 10;
		for (var j = 0 ; j < 12; ++j, temp += 10) {
			if (!(j % 4)) out.push('<tr>');
			if (temp < 1900 || temp > 2090) {
				out.push('<td>&nbsp;</td>');
				if (j + 1 == 12)
					out.push('</tr>'); 
				continue;
			}
			
			out.push('<td _dt="', temp ,'" id="', uuid, '-de', j, '" class="', (y >= temp && y <= (temp + 9)) ? zcls + '-seld' : '', '"',
					' >', temp + ydelta, '-<br />', temp + ydelta + 9, '</td>');
			if (!((j + 1) % 4)) out.push('</tr>');
		}
	}
};
var Calendar =
/**
 * A calendar.
 * <p>Default {@link #getZclass}: z-calendar.
 */
zul.db.Calendar = zk.$extends(zul.Widget, {
	_view : "day", //"day", "month", "year", "decade",
	
	$init: function () {
		this.$supers('$init', arguments);
		this.listen({onChange: this}, -1000);
	},
	$define: {
		/** Assigns a value to this component.
		 * @param Date value the date to assign. If null, today is assumed.
		 */
		/** Returns the value that is assigned to this component.
		 * @return Date
	 	 */
		value: function() {
			this.rerender();
		},
		/** Set the date limit for this component with yyyyMMdd format,
		 * such as 20100101 is mean Jan 01 2010 
		 * 
		 * <dl>
		 * <dt>Example:</dt>
		 * <dd>between 20091201 and 20091231</dd>
		 * <dd>before 20091201</dd>
		 * <dd>after 20091231</dd>
		 * </dl>
		 * 
		 * @param String constraint
		 */
		/** Returns the constraint of this component.
		 * @return String
		 */
		constraint: function() {
			var constraint = this._constraint || '';
			if (typeof this._constraint != 'string') return;
			// B50-ZK-591: Datebox constraint combination yyyymmdd and
			// no empty cause javascript error in zksandbox
			var constraints = constraint.split(','),
				format = 'yyyyMMdd',
				len = format.length + 1;
			for (var i = 0; i < constraints.length; i++) {
				constraint = jq.trim(constraints[i]); //Bug ZK-1718: should trim whitespace
				if (constraint.startsWith("between")) {
					var j = constraint.indexOf("and", 7);
					if (j < 0 && zk.debugJS) 
						zk.error('Unknown constraint: ' + constraint);
					this._beg = new zk.fmt.Calendar(null, this._localizedSymbols).parseDate(constraint.substring(7, j), format);
					this._end = new zk.fmt.Calendar(null, this._localizedSymbols).parseDate(constraint.substring(j + 3, j + 3 + len), format);
					if (this._beg.getTime() > this._end.getTime()) {
						var d = this._beg;
						this._beg = this._end;
						this._end = d;
					}
					
					this._beg.setHours(0, 0, 0, 0);
					this._end.setHours(0, 0, 0, 0);
				} else if (constraint.startsWith('before_') || constraint.startsWith('after_'))) {
					continue; //Constraint start with 'before_' and 'after_' means errorbox position, skip it
				} else if (constraint.startsWith("before")) {
					this._end = new zk.fmt.Calendar(null, this._localizedSymbols).parseDate(constraint.substring(6, 6 + len), format);
					this._end.setHours(0, 0, 0, 0);
				} else if (constraint.startsWith("after")) {
					this._beg = new zk.fmt.Calendar(null, this._localizedSymbols).parseDate(constraint.substring(5, 5 + len), format);
					this._beg.setHours(0, 0, 0, 0);
				}
			}
		},
		/** Sets the name of this component.
		 * <p>The name is used only to work with "legacy" Web application that
		 * handles user's request by servlets.
		 * It works only with HTTP/HTML-based browsers. It doesn't work
		 * with other kind of clients.
		 * <p>Don't use this method if your application is purely based
		 * on ZK's event-driven model.
		 *
		 * @param String name the name of this component.
		 */
		/** Returns the name of this component.
		 * <p>The name is used only to work with "legacy" Web application that
		 * handles user's request by servlets.
		 * It works only with HTTP/HTML-based browsers. It doesn't work
		 * with other kind of clients.
		 * <p>Don't use this method if your application is purely based
		 * on ZK's event-driven model.
		 * <p>Default: null.
		 * @return String
		 */
		name: function () {
			if (this.efield)
				this.efield.name = this._name;
		},
		/**
		 * Sets whether enable to show the week number within the current year or
    	 * not. [ZK EE]
    	 * @since 6.5.0
    	 * @param boolean weekOfYear
		 */
	    /**
	     * Returns whether enable to show the week number within the current year or not.
	     * <p>Default: false
	     * @since 6.5.0
	     * @return boolean
	     */
		weekOfYear: function () {
			if (this.desktop && zk.feature.ee)
				this.rerender();
		}
	},
	//@Override
	redraw: function () {
		zul.db.Renderer.beforeRedraw(this);
		this.$supers("redraw", arguments);
	},
	onChange: function (evt) {
		this._updFormData(evt.data.value);
	},
	doKeyDown_: function (evt) {
		var keyCode = evt.keyCode,
			ofs = keyCode == 37 ? -1 : keyCode == 39 ? 1 : keyCode == 38 ? -7 : keyCode == 40 ? 7 : 0;
		if (ofs) {
			this._shift(ofs);
		} else 
			this.$supers('doKeyDown_', arguments);
	},
	_shift: function (ofs, opts) {
		var oldTime = this.getTime();	
		
		switch(this._view) {
		case 'month':
		case 'year':
			if (ofs == 7)
				ofs = 4;
			else if (ofs == -7)
				ofs = -4;
			break;
		case 'decade':
			if (ofs == 7)
				ofs = 4;
			else if (ofs == -7)
				ofs = -4;
			ofs *= 10;
			
			var y = oldTime.getFullYear();
			if (y + ofs < 1900 || y + ofs > 2100)
				return;// out of range
//			break;
		}		
		this._shiftDate(this._view, ofs);
		var newTime = this.getTime();
		switch(this._view) {
		case 'day':
			if (oldTime.getYear() == newTime.getYear() &&
				oldTime.getMonth() == newTime.getMonth()) {
				this._markCal(opts);
			} else 
				this.rerender();
			break;
		case 'month':
			if (oldTime.getYear() == newTime.getYear())
				this._markCal(opts);
			else
				this.rerender();
			break;
		default:			
			this.rerender();
//			break;
		}
	},
	/** Returns the format of this component.
	 * @return String
	 */
	getFormat: function () {
		return this._fmt || "yyyy/MM/dd";
	},
	_updFormData: function (val) {
		val = new zk.fmt.Calendar().formatDate(val, this.getFormat(), this._localizedSymbols);
		if (this._name) {
			val = val || '';
			if (!this.efield)
				this.efield = jq.newHidden(this._name, val, this.$n());
			else
				this.efield.value = val;
		}
	},
	focus_: function (timeout) {
		if (this._view != 'decade') 
			this._markCal({timeout: timeout});
		else {
			var anc;
			if (anc = this.$n('a'))
				_doFocus(anc, true);
		}
		return true;
	},
	bind_: function (){
		this.$supers(Calendar, 'bind_', arguments);
		var node = this.$n(),
			title = this.$n("title"),
			mid = this.$n("mid"),
			tdl = this.$n("tdl"),
			tdr = this.$n("tdr"),
			zcls = this.getZclass();
		jq(title).hover(
			function () {
				jq(this).toggleClass(zcls + "-title-over");
			},
			function () {
				jq(this).toggleClass(zcls + "-title-over");
			}
		);
		if (this._view != 'decade') 
			this._markCal({silent: true});

		this.domListen_(title, "onClick", '_changeView')
			.domListen_(mid, "onClick", '_clickDate')
			.domListen_(tdl, "onClick", '_clickArrow')
			.domListen_(tdl, "onMouseOver", '_doMouseEffect')
			.domListen_(tdl, "onMouseOut", '_doMouseEffect')
			.domListen_(tdr, "onClick", '_clickArrow')
			.domListen_(tdr, "onMouseOver", '_doMouseEffect')
			.domListen_(tdr, "onMouseOut", '_doMouseEffect')
			.domListen_(mid, "onMouseOver", '_doMouseEffect')
			.domListen_(mid, "onMouseOut", '_doMouseEffect')
			.domListen_(node, 'onMousewheel');

		this._updFormData(this.getTime());
	},
	unbind_: function () {
		var node = this.$n(),
			title = this.$n("title"),
			mid = this.$n("mid"),
			tdl = this.$n("tdl"),
			tdr = this.$n("tdr");
		this.domUnlisten_(title, "onClick", '_changeView')
			.domUnlisten_(mid, "onClick", '_clickDate')
			.domUnlisten_(tdl, "onClick", '_clickArrow')			
			.domUnlisten_(tdl, "onMouseOver", '_doMouseEffect')
			.domUnlisten_(tdl, "onMouseOut", '_doMouseEffect')
			.domUnlisten_(tdr, "onClick", '_clickArrow')
			.domUnlisten_(tdr, "onMouseOver", '_doMouseEffect')
			.domUnlisten_(tdr, "onMouseOut", '_doMouseEffect')
			.domUnlisten_(mid, "onMouseOver", '_doMouseEffect')
			.domUnlisten_(mid, "onMouseOut", '_doMouseEffect')
			.domUnlisten_(node, 'onMousewheel')
			.$supers(Calendar, 'unbind_', arguments);
		this.efield = null;
	},
	rerender: function () {
		if (this.desktop) {
			var s = this.$n().style,
				w = s.width,
				h = s.height,
				result = this.$supers('rerender', arguments);
			s = this.$n().style;
			s.width = w;
			s.height = h;
			return result;
		}
	},
	_clickArrow: function (evt) {
		var node = evt.domTarget.id.indexOf("-ly") > 0 ? this.$n("tdl") :
				   evt.domTarget.id.indexOf("-ry") > 0 ?  this.$n("tdr") :
				   evt.domTarget;
		if (jq(node).hasClass(this.getZclass() + '-icon-disd'))
			return;
		this._shiftView(node.id.indexOf("-tdl") > 0 ? -1 : 1);
	},
	_shiftView: function (ofs) {
		switch(this._view) {
		case "day" :
			this._shiftDate("month", ofs);
			break;
		case "month" :
			this._shiftDate("year", ofs);
			break;
		case "year" :
			this._shiftDate("year", ofs*10);
			break;
		case "decade" :
			this._shiftDate("year", ofs*100);
//			break;
		}
		this.rerender();
	},
	_doMousewheel: function (evt, intDelta) {		
		if (jq(this.$n(-intDelta > 0 ? "tdr": "tdl")).hasClass(this.getZclass() + '-icon-disd'))
			return;
		this._shiftView(intDelta > 0 ? -1: 1);
		evt.stop();
	},
	_doMouseEffect: function (evt) {
		var	ly = this.$n("ly"),
			ry = this.$n("ry"), 
			$node = evt.domTarget == ly ? jq(this.$n("tdl")) :
					evt.domTarget == ry ? jq(this.$n("tdr")) : jq(evt.domTarget),
			zcls = this.getZclass();
		
		if ($node.hasClass(zcls + '-disd'))
			return;
			
		if ($node.is("."+zcls+"-seld")) {
			$node.removeClass(zcls + "-over")
				.toggleClass(zcls + "-over-seld");
		} else {
			//ZK-1215: onMouseOver and onMouseOut use the same function,
			//	do different behavior separately
			if (evt.name == "onMouseOver") {
				$node.toggleClass(zcls + "-over");
			} else {
				$node.removeClass(zcls + "-over");
			}
		}
	},
	/** Returns the Date that is assigned to this component.
	 *  <p>returns today if value is null
	 * @return Date
	 */
	getTime: function () {
		return this._value || zUtl.today(this.getFormat());
	},
	_setTime: function (y, m, d, hr, mi) {
		var dateobj = this.getTime(),
			year = y != null ? y  : dateobj.getFullYear(),
			month = m != null ? m : dateobj.getMonth(),
			day = d != null ? d : dateobj.getDate();
		this._value = _newDate(year, month, day, d == null);
		this.fire('onChange', {value: this._value});
	},
	_clickDate: function (evt) {
		var target = evt.domTarget, val;
		for (; target; target = target.parentNode)
			try { //Note: _dt is also used in mold/calendar.js
				if ((val = jq(target).attr("_dt")) !== undefined) {
					val = zk.parseInt(val);
					break;
				}
			} catch (e) {
				continue; //skip
			}
		this._chooseDate(target, val);
		var anc;
		if (anc = this.$n('a'))
			_doFocus(anc, true);

		evt.stop();
	},
	_chooseDate: function (target, val) {
		if (target && !jq(target).hasClass(this.getZclass() + '-disd')) {
			var cell = target,
				dateobj = this.getTime();
			switch(this._view) {
			case "day" :
				var oldTime = this.getTime();
				this._setTime(null, cell._monofs != null && cell._monofs != 0 ?
						dateobj.getMonth() + cell._monofs : null, val);
				var newTime = this.getTime();
				if (oldTime.getYear() == newTime.getYear() &&
					oldTime.getMonth() == newTime.getMonth()) {
						this._markCal();
				} else
					this.rerender();
				break;
			case "month" :
				this._setTime(null, val);
				this._setView("day");
				break;
			case "year" :
				this._setTime(val);
				this._setView("month");
				break;
			case "decade" :
				//Decade mode Set Year Also
				this._setTime(val);
				this._setView("year");
//				break;
			}
		}
	},
	_shiftDate: function (opt, ofs) {
		var dateobj = this.getTime(),
			year = dateobj.getFullYear(),
			month = dateobj.getMonth(),
			day = dateobj.getDate(),
			nofix;
		switch(opt) {
		case "day" :
			day += ofs;
			nofix = true;
			break;
		case "month" :
			month += ofs;
			break;
		case "year" :
			year += ofs;
			break;
		case "decade" :
			year += ofs;
//			break;
		}
		this._value = _newDate(year, month, day, !nofix);
		this.fire('onChange', {value: this._value, shallClose: false, shiftView: true});
	},
	_changeView : function (evt) {
		var tm = this.$n("tm"),
			ty = this.$n("ty"),
			tyd = this.$n("tyd"),
			title = this.$n("title");
		if (evt.domTarget == tm)
			this._setView("month");
		else if (evt.domTarget == ty)
			this._setView("year");
		else if (evt.domTarget == tyd )
			this._setView("decade");
		else if (tm != null && evt.domTarget == title)
			this._setView("month");
		evt.stop();
	},
	_setView : function (view) {
		if (view != this._view) {
			this._view = view;
			this.rerender();
		}
	},
	_markCal: function (opts) {
		this._markCal0(opts);
		var anc;
		if ((anc = this.$n('a')) && (!opts || !opts.silent))
			_doFocus(anc, opts && opts.timeout );
	},
	_markCal0: function (opts) {
		var	zcls = this.getZclass(),
		 	seldate = this.getTime(),
		 	m = seldate.getMonth(),
			y = seldate.getFullYear();
		if (this._view == 'day') {
			var d = seldate.getDate(),
				DOW_1ST = (this._localizedSymbols && this._localizedSymbols.DOW_1ST )|| zk.DOW_1ST, //ZK-1061
				v = new Date(y, m, 1).getDay()- DOW_1ST,
				last = new Date(y, m + 1, 0).getDate(), //last date of this month
				prev = new Date(y, m, 0).getDate(), //last date of previous month
				today = zUtl.today(); //no time part
			if (v < 0) v += 7;
			for (var j = 0, cur = -v + 1; j < 6; ++j) {
				var week = this.$n("w" + j);
				if (week != null) {
					for (var k = 0; k < 7; ++k, ++cur) {
						v = cur <= 0 ? prev + cur: cur <= last ? cur: cur - last;
						if (k == 0 && cur > last)
							week.style.display = "none";
						else {
							if (k == 0) week.style.display = "";
							var $cell = jq(week.cells[k]),
								monofs = cur <= 0 ? -1: cur <= last ? 0: 1,
								bSel = cur == d;
								
							$cell[0]._monofs = monofs;
							$cell.css('textDecoration', '').
								removeClass(zcls+"-seld");
								
							if (bSel) {
								$cell.addClass(zcls+"-seld");
								if ($cell.hasClass(zcls + "-over"))
									$cell.addClass(zcls + "-over-seld");
							} else {
								$cell.removeClass(zcls+"-seld");
								
								//ZK-1215: use mouse and keyboard to operate calendar at the same time
								//	must check and remove "-over-seld" css.
								if ($cell.hasClass(zcls + "-over-seld")) {
									$cell.removeClass(zcls + "-over")
										.removeClass(zcls + "-over-seld");
								}
							}
								
								
							//not same month
							$cell[monofs ? 'addClass': 'removeClass'](zcls+"-outside")
								[zul.db.Renderer.disabled(this, y, m + monofs, v, today) ? 
								'addClass': 'removeClass'](zcls+"-disd").
								html(zul.db.Renderer.cellHTML(this, y, m + monofs, v, monofs)).
								attr('_dt', v);
						}
					}
				}
			}
		} else {
			var isMon = this._view == 'month',
				field = isMon ? 'm': 'y',
				index = isMon? m: y % 10 + 1,
				node;
				
			for (var j = 0; j < 12; ++j)
				if (node = this.$n(field + j))
					jq(node)[index == j ? 'addClass': 'removeClass'](zcls+"-seld");
		}
	}
});
})();